pipeline {
    agent any

    stages {
        stage('BUILD_DOCKER_COMPOSE') {
            steps {
                sh 'docker compose up -d --build'
            }
        }

        stage('PIPELINE_FINISH') {
            steps {
                sh 'echo "PIPELINE FINISHED"'
            }
        }
    }
}