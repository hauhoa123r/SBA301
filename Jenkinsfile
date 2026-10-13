pipeline {
    agent any
    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
    }
    triggers { pollSCM('H/5 * * * *') }
    parameters {
        booleanParam(name: 'NGINX_ONLY', defaultValue: false,
            description: 'Deploy only Nginx; otherwise deploy backend and Nginx using the EC2 .env IMAGE_TAG.')
        booleanParam(name: 'BUILD_MYSQL_IMAGE', defaultValue: false,
            description: 'Build, verify and push MySQL only. Never upgrade or reset MySQL on EC2.')
    }
    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
        MYSQL_IMAGE_TAG = 'ci-validation-only'
        SERVER_IP = '16.178.47.5'
        DEPLOY_PATH = 'apps/SBA301'
        APP_SERVICES = "${params.NGINX_ONLY == false ? 'backend nginx' : 'nginx'}"
    }
    stages {
        stage('CHECKOUT_SOURCE') {
            steps { checkout scm }
        }
        stage('CHECK_ENVIRONMENT') {
            steps {
                sh '''
                    set -eu
                    docker --version
                    docker compose version
                    python3 --version
                    echo "Building tag $IMAGE_TAG; EC2 deployment uses its manually configured .env tag"
                '''
            }
        }
        stage('TAKE_ENV_FILE') {
            steps {
                sh '''
                    set -eu
                    cp /var/lib/jenkins/env/.env "$WORKSPACE/.env"
                    chmod 600 "$WORKSPACE/.env"
                '''
            }
        }
        stage('BUILD_IMAGE') {
            steps {
                sh '''
                    set -eu
                    rm -f "$WORKSPACE/.mysql-schema-verified"
                    docker compose --env-file "$WORKSPACE/.env" -f docker-compose.yml build $APP_SERVICES
                    if [ "${BUILD_MYSQL_IMAGE:-false}" = true ]; then
                        MYSQL_IMAGE_TAG="$IMAGE_TAG" docker compose --env-file "$WORKSPACE/.env" -f docker-compose.yml build mysql
                    fi
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
                        docker run --rm --workdir /backend --network "$test_network" \
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
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_TOKEN')]) {
                    sh '''
                        set -eu
                        set +x
                        printf '%s' "$DOCKER_TOKEN" | docker login --username "$DOCKER_USERNAME" --password-stdin
                        docker compose --env-file "$WORKSPACE/.env" -f docker-compose.yml push $APP_SERVICES
                        if [ "${BUILD_MYSQL_IMAGE:-false}" = true ]; then
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
        stage('CONNECT_SERVER') {
            steps {
                timeout(time: 10, unit: 'MINUTES') {
                    withCredentials([sshUserPrivateKey(credentialsId: 'azure-server-ssh',
                        keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                        sh '''
                            set -eu
                            ssh -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=yes \
                                -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" "mkdir -p '$DEPLOY_PATH/deployment'"
                            scp -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=yes \
                                -i "$SSH_KEY" deployment/deploy-app.sh deployment/verify-mysql-schema.sh \
                                deployment/verify-nginx-https.sh database/check-schema.sql \
                                "$SSH_USER@$SERVER_IP:$DEPLOY_PATH/deployment/"
                            ssh -o BatchMode=yes -o ConnectTimeout=15 -o StrictHostKeyChecking=yes \
                                -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" \
                                "cd '$DEPLOY_PATH' && sh deployment/deploy-app.sh '$APP_SERVICES'"
                        '''
                    }
                }
            }
        }
    }
    post {
        success { echo 'BUILD, TEST, PUSH AND COMPOSE DEPLOY PASSED' }
        failure { echo 'PIPELINE FAILED; inspect the failed check and restore application tags manually if needed' }
        always {
            sh '''
                docker logout || true
                rm -f "$WORKSPACE/.env" "$WORKSPACE/.mysql-schema-verified"
            '''
        }
    }
}
