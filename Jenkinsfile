pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
        SERVER_IP = "16.178.47.5"
        DEPLOY_PATH = "/home/deploy"
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
                    cp /var/lib/jenkins/env/.env "$WORKSPACE/.env"
                    test -f "$WORKSPACE/.env"
                '''
            }
        }

        stage('VALIDATE_COMPOSE') {
            steps {
                sh '''
                    docker compose \
                        --env-file "$WORKSPACE/.env" \
                        config --quiet
                    python3 deployment/validate_env.py --env-file "$WORKSPACE/.env"
                '''
            }
        }

        stage('BUILD_IMAGE') {
            steps {
                sh '''
                    echo "Building images with tag: $IMAGE_TAG"

                    docker compose \
                        --env-file "$WORKSPACE/.env" \
                        build
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
                        echo "$DOCKER_TOKEN" |
                            docker login \
                                --username "$DOCKER_USERNAME" \
                                --password-stdin

                        echo "Pushing images with tag: $IMAGE_TAG"

                        docker compose \
                            --env-file "$WORKSPACE/.env" \
                            push mysql backend nginx
                    '''
                }
            }
        }

        stage('CONNECT_SERVER') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    withCredentials([
                        sshUserPrivateKey(
                            credentialsId: 'azure-server-ssh',
                            keyFileVariable: 'SSH_KEY',
                            usernameVariable: 'SSH_USER'
                        )
                    ]) {
                        sh '''
                            chmod 600 "$SSH_KEY"
                            install -d -m 700 "$HOME/.ssh"

                            ssh -o BatchMode=yes -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" \
                                "mkdir -p '$DEPLOY_PATH/frontend' '$DEPLOY_PATH/monitoring' '$DEPLOY_PATH/deployment'"
                            scp -o BatchMode=yes -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" \
                                docker-compose.yml docker-compose.https.yml "$SSH_USER@$SERVER_IP:$DEPLOY_PATH/"
                            scp -o BatchMode=yes -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" \
                                frontend/nginx.https.conf "$SSH_USER@$SERVER_IP:$DEPLOY_PATH/frontend/"
                            scp -o BatchMode=yes -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" \
                                monitoring/prometheus.yml "$SSH_USER@$SERVER_IP:$DEPLOY_PATH/monitoring/"
                            scp -o BatchMode=yes -o StrictHostKeyChecking=accept-new -i "$SSH_KEY" \
                                deployment/validate_env.py "$SSH_USER@$SERVER_IP:$DEPLOY_PATH/deployment/"
                            ssh \
                                -o BatchMode=yes \
                                -o ConnectTimeout=15 \
                                -o StrictHostKeyChecking=accept-new \
                                -i "$SSH_KEY" \
                                "$SSH_USER@$SERVER_IP" \
                                "cd '$DEPLOY_PATH' &&
                                 test -f docker-compose.yml &&
                                 test -f .env &&
                                 python3 deployment/validate_env.py --env-file .env &&
                                 IMAGE_TAG='$IMAGE_TAG' docker compose --env-file .env pull &&
                                 IMAGE_TAG='$IMAGE_TAG' docker compose --env-file .env run --rm --no-deps nginx nginx -t &&
                                 IMAGE_TAG='$IMAGE_TAG' docker compose --env-file .env up -d --wait --wait-timeout 180 &&
                                 curl --retry 12 --retry-connrefused --retry-delay 5 -fsSL http://127.0.0.1/api/actuator/health > /dev/null &&
                                 IMAGE_TAG='$IMAGE_TAG' docker compose --env-file .env ps"
                        '''
                    }
                }
            }
        }

        stage('PIPELINE_FINISH') {
            steps {
                echo "PIPELINE FINISHED"
            }
        }
    }

    post {
        failure {
            echo 'PIPELINE FAILED'
        }

        success {
            echo 'BUILD, PUSH AND DEPLOY SUCCESSFULLY'
        }

        always {
            sh '''
                docker logout || true
                rm -f "$WORKSPACE/.env"
            '''
        }
    }
}
