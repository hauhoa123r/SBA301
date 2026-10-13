
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
                     description: 'Chi build va deploy frontend')
        booleanParam(name: 'BUILD_MYSQL_IMAGE', defaultValue: false,
                     description: 'Build va push MySQL image khi can')
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
                    set -e
                    cd backend
                    mvn clean verify
                '''
            }
            when {
                expression { !params.NGINX_ONLY }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                    set -e

                    if [ "$NGINX_ONLY" = "true" ]; then
                        docker build -t devhoa/chinese-nginx:$IMAGE_TAG ./frontend
                    else
                        docker build -t devhoa/chinese-backend:$IMAGE_TAG ./backend
                        docker build -t devhoa/chinese-nginx:$IMAGE_TAG ./frontend
                    fi

                    if [ "$BUILD_MYSQL_IMAGE" = "true" ]; then
                        docker build -t devhoa/chinese-mysql:$IMAGE_TAG ./database
                    fi
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
                        set -e
                        echo "$DOCKER_TOKEN" | docker login \
                            -u "$DOCKER_USERNAME" --password-stdin

                        if [ "$NGINX_ONLY" = "true" ]; then
                            docker push devhoa/chinese-nginx:$IMAGE_TAG
                        else
                            docker push devhoa/chinese-backend:$IMAGE_TAG
                            docker push devhoa/chinese-nginx:$IMAGE_TAG
                        fi

                        if [ "$BUILD_MYSQL_IMAGE" = "true" ]; then
                            docker push devhoa/chinese-mysql:$IMAGE_TAG
                        fi
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
                        set -e

                        ssh -o BatchMode=yes \
                            -o StrictHostKeyChecking=yes \
                            -i "$SSH_KEY" \
                            "$SSH_USER@$SERVER_IP" \
                            "cd '$DEPLOY_PATH' && \
                             docker compose --env-file .env pull \
                             $([ '$NGINX_ONLY' = 'true' ] && echo nginx || echo 'backend nginx') && \
                             docker compose --env-file .env up -d --no-deps \
                             $([ '$NGINX_ONLY' = 'true' ] && echo nginx || echo 'backend nginx')"
                    '''
                }
            }
        }
    }

    post {
        success {
            echo 'CI/CD SUCCESS'
        }
        failure {
            echo 'CI/CD FAILED'
        }
        always {
            sh 'docker logout || true'
        }
    }
}
