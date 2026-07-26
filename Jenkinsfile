pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Results') {
            steps {
                sh '''
                    rm -rf results
                    mkdir -p results/html-report
                '''
            }
        }

        stage('Run JMeter Performance Test') {
            steps {
                sh '''
                    docker run --rm \
                      --user root \
                      --network performance-test-network \
                      -v "$WORKSPACE:/test" \
                      justb4/jmeter:latest \
                      -n \
                      -t /test/jmeter/ecommerce-api-performance-test.jmx \
                      -l /test/results/results.jtl \
                      -e \
                      -o /test/results/html-report
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts(
                artifacts: 'results/results.jtl, results/html-report/**',
                allowEmptyArchive: true
            )
        }
    }
}