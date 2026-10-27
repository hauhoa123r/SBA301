pipeline {
    agent any
    options {
        skipDefaultCheckout(true)
        timestamps()
        disableConcurrentBuilds()
    }
    triggers { pollSCM('H/5 * * * *') }
    parameters {
        booleanParam(name: 'DEPLOY_SINGAPORE', defaultValue: false,
                     description: 'Explicit release: push application images and deploy Singapore. Default CI is read-only on EC2.')
    }
    environment {
        SERVER_IP = '54.169.83.95'
        DEPLOY_PATH = '/home/ubuntu/.edujar-migration/final-20261024'
        SSH_CREDENTIAL_ID = 'edujar-singapore-ssh'
    }
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.RELEASE_REVISION = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                    env.IMAGE_TAG = "sg-${env.RELEASE_REVISION.take(12)}-${env.BUILD_NUMBER}"
                }
            }
        }
        stage('Build and Test') {
            steps {
                sh '''
                    set -eu
                    python3 database/generate-schema-check.py --check
                    python3 -m unittest scripts.tests.test_singapore_deploy -v
                    (cd backend && mvn clean verify)
                    docker build --platform linux/amd64 --label "org.opencontainers.image.revision=$RELEASE_REVISION" -t "devhoa/chinese-backend:$IMAGE_TAG" backend
                    docker build --platform linux/amd64 --label "org.opencontainers.image.revision=$RELEASE_REVISION" -t "devhoa/chinese-nginx:$IMAGE_TAG" frontend
                '''
            }
        }
        stage('Verify Singapore Access') {
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CREDENTIAL_ID,
                                                   keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh '''
                        set -eu
                        set +x
                        test "$SSH_USER" = ubuntu
                        test -s scripts/singapore-known_hosts
                        scp -F /dev/null -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$WORKSPACE/scripts/singapore-known_hosts" -i "$SSH_KEY" scripts/deploy-singapore.py database/tests/check-schema.sql "$SSH_USER@$SERVER_IP:$DEPLOY_PATH/"
                        ssh -F /dev/null -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$WORKSPACE/scripts/singapore-known_hosts" -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" "python3 '$DEPLOY_PATH/deploy-singapore.py' --check-only --guard '$DEPLOY_PATH/check-schema.sql'"
                    '''
                }
            }
        }
        stage('Push Application Images') {
            when { expression { params.DEPLOY_SINGAPORE } }
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub-credentials',
                                                   usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_TOKEN')]) {
                    sh '''
                        set -eu
                        set +x
                        export DOCKER_CONFIG=$(mktemp -d)
                        trap 'docker logout >/dev/null 2>&1 || true; rm -f "$DOCKER_CONFIG/config.json"; rmdir "$DOCKER_CONFIG" 2>/dev/null || true' EXIT
                        printf '%s' "$DOCKER_TOKEN" | docker login -u "$DOCKER_USERNAME" --password-stdin
                        docker push "devhoa/chinese-backend:$IMAGE_TAG"
                        docker push "devhoa/chinese-nginx:$IMAGE_TAG"
                    '''
                }
            }
        }
        stage('Deploy Singapore Applications') {
            when { expression { params.DEPLOY_SINGAPORE } }
            steps {
                withCredentials([sshUserPrivateKey(credentialsId: env.SSH_CREDENTIAL_ID,
                                                   keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                    sh '''
                        set -eu
                        set +x
                        ssh -F /dev/null -o BatchMode=yes -o IdentitiesOnly=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile="$WORKSPACE/scripts/singapore-known_hosts" -i "$SSH_KEY" "$SSH_USER@$SERVER_IP" "python3 '$DEPLOY_PATH/deploy-singapore.py' --guard '$DEPLOY_PATH/check-schema.sql' --backend-image 'devhoa/chinese-backend:$IMAGE_TAG' --nginx-image 'devhoa/chinese-nginx:$IMAGE_TAG' --revision '$RELEASE_REVISION'"
                    '''
                }
            }
        }
        stage('Verify Public HTTPS') {
            steps {
                sh '''
                    set -eu
                    curl --fail --silent --show-error --output /dev/null https://edujar.site/
                    curl --fail --silent --show-error https://edujar.site/api/actuator/health | grep -q '"status":"UP"'
                '''
            }
        }
    }
}
