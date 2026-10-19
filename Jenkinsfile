
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

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
        SERVER_IP = '16.178.47.5'
        DEPLOY_PATH = 'apps/SBA301'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test') {
            steps {
                sh '''
                    set -eu

                    python3 database/generate-schema-check.py --check
                    cd backend
                    mvn clean verify
                '''
            }
        }

        stage('Fresh MySQL Initialization') {
            steps {
                sh '''
                    set -eu
                    # Own image/container, tmpfs datadir, loopback test port; no production volumes.
                    python3 database/tests/fresh_initialization.py --docker --backend
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -eu

                    echo "Building backend image: $IMAGE_TAG"
                    docker build \
                        -t devhoa/chinese-backend:$IMAGE_TAG \
                        ./backend

                    echo "Building nginx image: $IMAGE_TAG"
                    docker build \
                        -t devhoa/chinese-nginx:$IMAGE_TAG \
                        ./frontend
                '''
            }
        }

        stage('Push Docker Hub') {
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

                        printf '%s' "$DOCKER_TOKEN" | \
                            docker login \
                                -u "$DOCKER_USERNAME" \
                                --password-stdin

                        docker push devhoa/chinese-backend:$IMAGE_TAG
                        docker push devhoa/chinese-nginx:$IMAGE_TAG
                    '''
                }
            }
        }

        stage('Deploy EC2') {
            steps {
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
                            "set -e
                             cd '$DEPLOY_PATH'

                             export IMAGE_TAG='$IMAGE_TAG'

                             echo 'Pulling Docker images...'
                             docker compose --env-file .env pull \
                                 backend nginx

                             echo 'Deploying containers...'
                             docker compose --env-file .env up \
                                 -d --no-deps --force-recreate \
                                 backend nginx

                             echo 'Deployment status:'
                             docker compose --env-file .env ps \
                                 backend nginx"
                    '''
                }
            }
        }

        stage('Verify Deployment') {
            steps {
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
                            "set -e
                             cd '$DEPLOY_PATH'

                             test \\"\\$(docker inspect chinese-backend --format '{{.State.Running}}')\\" = true
                             test \\"\\$(docker inspect chinese-nginx --format '{{.State.Running}}')\\" = true

                             echo 'Backend and Nginx are running.'
                             docker ps --filter name=chinese-backend \
                                       --filter name=chinese-nginx"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "CI/CD SUCCESS - VERSION: ${IMAGE_TAG}"
        }

        failure {
            echo "CI/CD FAILED - BUILD: ${BUILD_NUMBER}"
        }

        always {
            sh '''
                docker logout >/dev/null 2>&1 || true
            '''
        }
    }
}
