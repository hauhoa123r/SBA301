
pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
        timestamps()
    }

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
        SERVER_IP = '16.178.47.5'
        DEPLOY_PATH = 'apps/SBA301'
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
                    test -f monitoring/prometheus.yml

                    docker compose \
                        --env-file "$WORKSPACE/.env" \
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
                        build mysql backend nginx
                '''
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
                            push mysql backend nginx
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

                                 docker compose --env-file .env config --quiet;

                                 docker compose --env-file .env pull mysql backend nginx;

                                 docker compose --env-file .env up -d --no-build --wait --wait-timeout 180;

                                 docker exec chinese-nginx nginx -t;

                                 curl --fail --silent --show-error --retry 12 --retry-connrefused --retry-delay 5 --resolve edujar.site:443:127.0.0.1 https://edujar.site/api/actuator/health;

                                 docker compose --env-file .env ps"
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
            '''
        }
    }
}
