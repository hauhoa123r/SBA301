pipeline {
    agent any

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
        SERVER_IP = "13.229.59.153"
        DEPLOY_PATH = "/home/deploy"
    }

    stages {
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
                            push
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

                            ssh \
                                -o BatchMode=yes \
                                -o ConnectTimeout=15 \
                                -o StrictHostKeyChecking=no \
                                -i "$SSH_KEY" \
                                "$SSH_USER@$SERVER_IP" \
                                "cd '$DEPLOY_PATH' &&
                                 IMAGE_TAG='$IMAGE_TAG' docker compose pull &&
                                 IMAGE_TAG='$IMAGE_TAG' docker compose up -d &&
                                 IMAGE_TAG='$IMAGE_TAG' docker compose ps"
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
            sh 'docker logout || true'
        }
    }
}