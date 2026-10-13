
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    parameters {
        booleanParam(name: 'NGINX_ONLY', defaultValue: true,
            description: 'Rebuild and deploy only Nginx for HTTPS recovery; unchecked also deploys backend. MySQL is never redeployed.')
        booleanParam(name: 'BUILD_MYSQL_IMAGE', defaultValue: false,
            description: 'Build, validate on an isolated database, and push the MySQL image. Does not reset or redeploy the EC2 database.')
    }

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
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

        stage('BUILD_IMAGE') {
            steps {
                sh '''
                    set -eu
                    echo "Building image tag: $IMAGE_TAG"

                    docker compose \
                        --env-file "$WORKSPACE/.env" \
                        -f docker-compose.yml \
                        build $APP_SERVICES

                    if [ "${BUILD_MYSQL_IMAGE:-false}" = 'true' ]; then
                        MYSQL_IMAGE_TAG="$IMAGE_TAG" docker compose --env-file "$WORKSPACE/.env" -f docker-compose.yml build mysql
                        docker image inspect "devhoa/chinese-mysql:$IMAGE_TAG" --format '{{.Id}}'
                    fi

                    expected_config_sha=$(sha256sum frontend/nginx.conf | cut -d ' ' -f 1)
                    image_config_sha=$(docker run --rm --entrypoint sha256sum \
                        "devhoa/chinese-nginx:$IMAGE_TAG" /etc/nginx/conf.d/default.conf | cut -d ' ' -f 1)
                    test "$image_config_sha" = "$expected_config_sha"
                    printf '%s\\n' "$expected_config_sha" > "$WORKSPACE/.nginx-config-sha256"
                    docker image inspect "devhoa/chinese-nginx:$IMAGE_TAG" --format '{{.Id}}' > "$WORKSPACE/.nginx-image-id"
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
                            MYSQL_IMAGE_TAG="$IMAGE_TAG" docker compose --env-file "$WORKSPACE/.env" -f docker-compose.yml push mysql
                        fi
                    '''
                }
            }
        }

        stage('CONNECT_SERVER') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    withCredentials([
                        sshUserPrivateKey(
                            credentialsId: 'azure-server-ssh',
                            keyFileVariable: 'SSH_KEY',
                            usernameVariable: 'SSH_USER'
                        )
                    ]) {
                        sh '''
                            set -eu

                            ssh \
                                -o BatchMode=yes \
                                -o ConnectTimeout=15 \
                                -o StrictHostKeyChecking=yes \
                                -i "$SSH_KEY" \
                                "$SSH_USER@$SERVER_IP" \
                                "mkdir -p '$DEPLOY_PATH/monitoring' '$DEPLOY_PATH/deployment/acme'"

                            scp \
                                -o BatchMode=yes \
                                -o ConnectTimeout=15 \
                                -o StrictHostKeyChecking=yes \
                                -i "$SSH_KEY" \
                                docker-compose.yml \
                                "$SSH_USER@$SERVER_IP:$DEPLOY_PATH/"

                            scp \
                                -o BatchMode=yes \
                                -o ConnectTimeout=15 \
                                -o StrictHostKeyChecking=yes \
                                -i "$SSH_KEY" \
                                monitoring/prometheus.yml \
                                "$SSH_USER@$SERVER_IP:$DEPLOY_PATH/monitoring/"

                            scp \
                                -o BatchMode=yes \
                                -o ConnectTimeout=15 \
                                -o StrictHostKeyChecking=yes \
                                -i "$SSH_KEY" \
                                deployment/verify-nginx-https.sh \
                                "$SSH_USER@$SERVER_IP:$DEPLOY_PATH/deployment/"

                            expected_image_id=$(cat "$WORKSPACE/.nginx-image-id")
                            expected_config_sha=$(cat "$WORKSPACE/.nginx-config-sha256")

                            ssh \
                                -o BatchMode=yes \
                                -o ConnectTimeout=15 \
                                -o StrictHostKeyChecking=yes \
                                -i "$SSH_KEY" \
                                "$SSH_USER@$SERVER_IP" \
                                "set -eu;
                                 cd '$DEPLOY_PATH';
                                 export IMAGE_TAG='$IMAGE_TAG';
                                 test -f docker-compose.yml;
                                 test -s .env;

                                 docker compose --env-file .env -f docker-compose.yml config --quiet;

                                 docker compose --env-file .env -f docker-compose.yml pull $APP_SERVICES;

                                 docker image inspect 'devhoa/chinese-nginx:$IMAGE_TAG' --format '{{.Id}}' | grep -Fx '$expected_image_id';

                                 docker compose --env-file .env -f docker-compose.yml run --rm --no-deps --entrypoint nginx nginx -t;

                                 if [ '$APP_SERVICES' = 'backend nginx' ]; then
                                     docker compose --env-file .env -f docker-compose.yml up -d --no-build --no-deps --wait --wait-timeout 180 backend;
                                 fi;

                                 docker compose --env-file .env -f docker-compose.yml up -d --no-build --no-deps --force-recreate --wait --wait-timeout 180 nginx;

                                 sh deployment/verify-nginx-https.sh 'devhoa/chinese-nginx:$IMAGE_TAG' '$expected_image_id' '$expected_config_sha';

                                 docker compose --env-file .env -f docker-compose.yml ps"
                        '''
                    }
                }
            }
        }

        stage('VERIFY_PUBLIC_HTTPS') {
            steps {
                sh '''
                    set -eu
                    for route in learning subscriptions; do
                        result=$(curl --fail --silent --show-error --noproxy '*' --connect-timeout 5 --max-time 15 \
                            --retry 5 --retry-connrefused --retry-delay 2 --retry-max-time 45 \
                            --output /dev/null --write-out '%{http_code} %{content_type}' "https://edujar.site/$route")
                        case "$result" in
                            '200 text/html'|'200 text/html;'*) ;;
                            *) echo "Public HTTPS /$route failed: $result" >&2; exit 1 ;;
                        esac
                    done
                '''
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
            '''
        }
    }
}
