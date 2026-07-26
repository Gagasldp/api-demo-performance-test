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
                    mkdir -p results
                    chmod -R 777 results
                '''
            }
        }

        stage('Run JMeter Test') {
            steps {
                sh '''
                    docker run --rm \
                      --user root \
                      --network performance-test-network \
                      -v "$WORKSPACE/jmeter:/test/jmeter:ro" \
                      -v "$WORKSPACE/results:/test/results" \
                      justb4/jmeter:latest \
                      -n \
                      -t /test/jmeter/ecommerce-api-performance-test.jmx \
                      -l /test/results/results.jtl
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts(
                artifacts: 'results/results.jtl',
                allowEmptyArchive: true
            )
        }
    }
}