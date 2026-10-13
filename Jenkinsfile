
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    parameters {
        booleanParam(name: 'NGINX_ONLY', defaultValue: false,
            description: 'Emergency Nginx-only release; normal releases deploy backend and Nginx.')
        booleanParam(name: 'BUILD_MYSQL_IMAGE', defaultValue: false,
            description: 'Build, validate on an isolated database, and push the MySQL image. Does not reset or redeploy the EC2 database.')
        booleanParam(name: 'DEPLOY_MYSQL_IMAGE', defaultValue: false,
            description: 'Request a separate approved MySQL image upgrade. Requires BUILD_MYSQL_IMAGE, backup, reviewed migrations and an interactive DB approval.')
    }

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
        BACKEND_IMAGE_TAG = "${BUILD_NUMBER}"
        NGINX_IMAGE_TAG = "${BUILD_NUMBER}"
        MYSQL_IMAGE_TAG = 'ci-validation-only'
        DB_APPROVERS = 'sba301-db-admins'
        SERVER_IP = '16.178.47.5'
        DEPLOY_PATH = 'apps/SBA301'
        APP_SERVICES = "${params.NGINX_ONLY == false ? 'backend nginx' : 'nginx'}"
    }

    stages {
        stage('CHECKOUT_SOURCE') {
            steps {
                checkout scm
            }
        }

        stage('CHECK_ENVIRONMENT') {
            steps {
                sh '''
                    set -eu
                    docker --version
                    docker compose version
                    python3 --version
                    if [ "${DEPLOY_MYSQL_IMAGE:-false}" = true ]; then
                        test "${BUILD_MYSQL_IMAGE:-false}" = true
                    fi
                    echo "BUILD_NUMBER=$BUILD_NUMBER"
                    echo "IMAGE_TAG=$IMAGE_TAG"
                    whoami
                    pwd
                '''
            }
        }

        stage('TAKE_ENV_FILE') {
            steps {
                sh '''
                    set -eu
                    cp /var/lib/jenkins/env/.env "$WORKSPACE/.env"
                    chmod 600 "$WORKSPACE/.env"
                    test -s "$WORKSPACE/.env"
                '''
            }
        }

        stage('VALIDATE_COMPOSE') {
            steps {
                sh '''
                    set -eu
                    test -f frontend/nginx.conf
                    test -f deployment/verify-nginx-https.sh
                    test -f monitoring/prometheus.yml

                    docker compose \
                        --env-file "$WORKSPACE/.env" \
                        -f docker-compose.yml \
                        config --quiet
                '''
            }
        }

        stage('TEST_BEFORE_RELEASE') {
            steps {
                sh '''
                    set -eu
                    python3 -m unittest discover -s deployment/tests -v
                    python3 -m unittest discover -s database/tests -v
                    python3 database/generate-schema-check.py --check
                    docker build --target build -t "edujar-backend-tests:$IMAGE_TAG" backend
                    docker run --rm "edujar-backend-tests:$IMAGE_TAG" mvn test
                    docker build --target build -t "edujar-frontend-tests:$IMAGE_TAG" frontend
                    docker run --rm "edujar-frontend-tests:$IMAGE_TAG" npm test
                '''
            }
        }

        stage('BUILD_IMAGE') {
            steps {
                sh '''
                    set -eu
                    rm -f "$WORKSPACE/.mysql-schema-verified"
                    rm -f "$WORKSPACE/.release/db-approval.json"
                    mkdir -p "$WORKSPACE/.release"
                    echo "Building image tag: $IMAGE_TAG"

                    docker compose \
                        --env-file "$WORKSPACE/.env" \
                        -f docker-compose.yml \
                        build $APP_SERVICES

                    if [ "${BUILD_MYSQL_IMAGE:-false}" = 'true' ]; then
                        MYSQL_IMAGE_TAG="$IMAGE_TAG" docker compose --env-file "$WORKSPACE/.env" -f docker-compose.yml build mysql
                        docker image inspect "devhoa/chinese-mysql:$IMAGE_TAG" --format '{{.Id}}'
                    fi

                    record_services="$APP_SERVICES"
                    if [ "${BUILD_MYSQL_IMAGE:-false}" = true ]; then record_services="$record_services mysql"; fi
                    python3 deployment/release.py record-build --tag "$IMAGE_TAG" \
                        --services $record_services --out "$WORKSPACE/.release/built-images.json"
                '''
            }
        }

        stage('VERIFY_FRESH_MYSQL_SCHEMA') {
            when { expression { params.BUILD_MYSQL_IMAGE == true } }
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    sh '''
                        set -eu
                        set +x
                        test_id="$BUILD_NUMBER-$(openssl rand -hex 6)"
                        test_container="edujar-schema-$test_id"
                        test_network="edujar-schema-$test_id"
                        network_created=false
                        cleanup_schema_test() {
                            owner=$(docker inspect "$test_container" --format '{{index .Config.Labels "com.edujar.schema-test"}}' 2>/dev/null || true)
                            if [ "$owner" = "$test_id" ]; then
                                docker rm -fv "$test_container" >/dev/null 2>&1 || true
                            fi
                            if [ "$network_created" = true ]; then
                                docker network rm "$test_network" >/dev/null 2>&1 || true
                            fi
                        }
                        trap cleanup_schema_test EXIT
                        trap 'exit 1' HUP INT TERM
                        docker network create "$test_network" >/dev/null
                        network_created=true
                        export MYSQL_ROOT_PASSWORD=$(openssl rand -hex 24)
                        export MYSQL_PASSWORD=$(openssl rand -hex 24)
                        docker run -d --name "$test_container" --label "com.edujar.schema-test=$test_id" \
                            --network "$test_network" --network-alias mysql-schema-test \
                            -e MYSQL_ROOT_PASSWORD -e MYSQL_PASSWORD \
                            -e MYSQL_USER=chinese_app -e MYSQL_DATABASE=chinese_online_learning \
                            --health-cmd 'MYSQL_PWD="$MYSQL_PASSWORD" mysql --protocol=TCP -h127.0.0.1 -uchinese_app -Dchinese_online_learning -e "SELECT 1" --silent' \
                            --health-interval 2s --health-timeout 5s --health-retries 60 \
                            "devhoa/chinese-mysql:$IMAGE_TAG" >/dev/null
                        attempts=0
                        until [ "$(docker inspect "$test_container" --format '{{.State.Health.Status}}')" = healthy ]; do
                            attempts=$((attempts + 1))
                            state=$(docker inspect "$test_container" --format '{{.State.Status}}')
                            if [ "$attempts" -ge 90 ] || [ "$state" = exited ]; then
                                docker logs --tail 100 "$test_container"
                                exit 1
                            fi
                            sleep 2
                        done
                        docker exec "$test_container" sh /usr/local/bin/verify-edujar-schema
                        docker build --target build -t "edujar-schema-tests:$IMAGE_TAG" backend
                        export FRESH_SCHEMA_PASSWORD="$MYSQL_PASSWORD"
                        docker run --rm --network "$test_network" \
                            -v "$WORKSPACE/database:/database:ro" \
                            -e RUN_FRESH_SCHEMA_TESTS=true -e FRESH_SCHEMA_USER=chinese_app -e FRESH_SCHEMA_PASSWORD \
                            -e 'FRESH_SCHEMA_JDBC_URL=jdbc:mysql://mysql-schema-test:3306/chinese_online_learning?serverTimezone=UTC' \
                            "edujar-schema-tests:$IMAGE_TAG" mvn -Dtest=JpaSchemaContractTest test
                        sh database/tests/fresh-mysql-regression.sh "$test_container" "$test_id"
                        docker inspect "$test_container" --format '{{.Image}}' > "$WORKSPACE/.mysql-schema-verified"
                    '''
                }
            }
        }

        stage('PUSH_IMAGE') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_TOKEN'
                    )
                ]) {
                    sh '''
                        set -eu
                        set +x

                        printf '%s' "$DOCKER_TOKEN" |
                            docker login \
                                --username "$DOCKER_USERNAME" \
                                --password-stdin

                        echo "Pushing image tag: $IMAGE_TAG"

                        docker compose \
                            --env-file "$WORKSPACE/.env" \
                            -f docker-compose.yml \
                            push $APP_SERVICES

                        if [ "${BUILD_MYSQL_IMAGE:-false}" = 'true' ]; then
                            test -s "$WORKSPACE/.mysql-schema-verified"
                            verified_mysql_id=$(cat "$WORKSPACE/.mysql-schema-verified")
                            actual_mysql_id=$(docker image inspect "devhoa/chinese-mysql:$IMAGE_TAG" --format '{{.Id}}')
                            test "$actual_mysql_id" = "$verified_mysql_id"
                            MYSQL_IMAGE_TAG="$IMAGE_TAG" docker compose --env-file "$WORKSPACE/.env" -f docker-compose.yml push mysql
                        fi
                    '''
                }
            }
        }

        stage('PREPARE_RELEASE') {
            steps {
                sh '''
                    set -eu
                    python3 deployment/release.py prepare-release \
                        --build-record "$WORKSPACE/.release/built-images.json" \
                        --out "$WORKSPACE/.release/release.json"
                '''
                archiveArtifacts artifacts: '.release/release.json', fingerprint: true
            }
        }

        stage('APPROVE_DATABASE_UPGRADE') {
            when { expression { params.DEPLOY_MYSQL_IMAGE == true } }
            steps {
                timeout(time: 1, unit: 'HOURS') {
                    script {
                        def approval = input(
                            message: "Upgrade MySQL image to ${env.IMAGE_TAG} on its EXISTING volume? Confirm backup, tested reviewed migrations and maintenance window. Init SQL will NOT migrate it.",
                            ok: 'Approve database upgrade',
                            submitter: env.DB_APPROVERS,
                            submitterParameter: 'APPROVED_BY',
                            parameters: [string(name: 'BACKUP_REFERENCE', defaultValue: '', description: 'Verified backup reference (for example s3://bucket/key); no credentials.')]
                        )
                        if (!(approval.BACKUP_REFERENCE ==~ /[A-Za-z0-9_:\/.-]{1,256}/)) {
                            error('A valid verified backup reference is required')
                        }
                        writeFile file: '.release/db-approval.json', text: groovy.json.JsonOutput.toJson([
                            release_tag: env.IMAGE_TAG,
                            approved_by: approval.APPROVED_BY,
                            backup_reference: approval.BACKUP_REFERENCE
                        ])
                        archiveArtifacts artifacts: '.release/db-approval.json', fingerprint: true
                    }
                }
            }
        }

        stage('CONNECT_SERVER') {
            steps {
                timeout(time: 20, unit: 'MINUTES') {
                    withCredentials([
                        sshUserPrivateKey(
                            credentialsId: 'azure-server-ssh',
                            keyFileVariable: 'SSH_KEY',
                            usernameVariable: 'SSH_USER'
                        )
                    ]) {
                        sh '''
                            set -eu

                            deployed=false
                            rollback_after_external_failure() {
                                status=$?
                                trap - EXIT
                                if [ "$status" -ne 0 ] && [ "$deployed" = true ]; then
                                    ssh -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=yes \
                                        -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" \
                                        "cd '$DEPLOY_PATH' && python3 deployment/releases/$IMAGE_TAG/release.py rollback --root . --payload deployment/releases/$IMAGE_TAG --expected-tag '$IMAGE_TAG' $nginx_only_arg" \
                                        || echo 'Application rollback failed; operator intervention required' >&2
                                fi
                                exit "$status"
                            }
                            trap rollback_after_external_failure EXIT
                            trap 'exit 1' HUP INT TERM

                            ssh \
                                -o BatchMode=yes \
                                -o ConnectTimeout=15 \
                                -o StrictHostKeyChecking=yes \
                                -i "$SSH_KEY" \
                                "$SSH_USER@$SERVER_IP" \
                                "mkdir -p '$DEPLOY_PATH/deployment/releases/$IMAGE_TAG'"

                            scp \
                                -o BatchMode=yes \
                                -o ConnectTimeout=15 \
                                -o StrictHostKeyChecking=yes \
                                -i "$SSH_KEY" \
                                "$WORKSPACE/.release/release.json" \
                                deployment/release.py \
                                deployment/compose.production.yml \
                                deployment/verify-nginx-https.sh \
                                database/check-schema.sql \
                                "$SSH_USER@$SERVER_IP:$DEPLOY_PATH/deployment/releases/$IMAGE_TAG/"

                            if [ "${DEPLOY_MYSQL_IMAGE:-false}" = true ]; then
                                scp -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=yes \
                                    -i "$SSH_KEY" "$WORKSPACE/.release/db-approval.json" \
                                    "$SSH_USER@$SERVER_IP:$DEPLOY_PATH/deployment/releases/$IMAGE_TAG/"
                            fi
                            nginx_only_arg=''
                            if [ "${NGINX_ONLY:-false}" = true ]; then nginx_only_arg='--nginx-only'; fi

                            ssh \
                                -o BatchMode=yes \
                                -o ConnectTimeout=15 \
                                -o StrictHostKeyChecking=yes \
                                -i "$SSH_KEY" \
                                "$SSH_USER@$SERVER_IP" \
                                "set -eu;
                                 cd '$DEPLOY_PATH';
                                 if [ '${DEPLOY_MYSQL_IMAGE:-false}' = 'true' ]; then
                                     python3 deployment/releases/$IMAGE_TAG/release.py deploy-database --root . --payload deployment/releases/$IMAGE_TAG --manifest deployment/releases/$IMAGE_TAG/release.json --approval deployment/releases/$IMAGE_TAG/db-approval.json;
                                 fi;
                                 python3 deployment/releases/$IMAGE_TAG/release.py deploy --root . --payload deployment/releases/$IMAGE_TAG --manifest deployment/releases/$IMAGE_TAG/release.json $nginx_only_arg"
                            deployed=true
                            python3 deployment/release.py smoke-public
                        '''
                    }
                }
            }
        }

        stage('PIPELINE_FINISH') {
            steps {
                echo 'PIPELINE FINISHED'
            }
        }
    }

    post {
        failure {
            echo 'PIPELINE FAILED'
        }

        success {
            echo 'BUILD, PUSH AND HTTPS DEPLOY SUCCESSFULLY'
        }

        always {
            sh '''
                docker logout || true
                rm -f "$WORKSPACE/.env"
                rm -f "$WORKSPACE/.nginx-config-sha256" "$WORKSPACE/.nginx-image-id"
                rm -f "$WORKSPACE/.mysql-schema-verified"
                rm -f "$WORKSPACE/.release/built-images.json" "$WORKSPACE/.release/release.json" "$WORKSPACE/.release/db-approval.json"
            '''
        }
    }
}
