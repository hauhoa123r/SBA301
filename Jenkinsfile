pipeline {
    agent any

    stages {
        stage('CHECK_ENVIRONMENT') {
            steps {
                sh 'java -version'
                sh 'docker -version'
                sh 'pwd'
                sh 'whoami'
            }
        }

        stage('CHECK_PROJECT') {
            steps {
                sh 'ls -la'
                sh '[ -d "backend" ] && echo "exist backend" || echo "missing backend"'
                sh '[ -d "frontend" ] && echo "exist frontend" || echo "missing frontend"'
                sh '[ -f "docker-compose.yml" ] && echo "exist docker compose file" || echo "missing docker compose file"'
            }
        }

        stage('PIPELINE_FINISH') {
            steps {
                sh 'echo "PIPELINE FINISHED"'
            }
        }
    }
}