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
            rm -rf results
            mkdir -p results

            docker run --rm \
              --user root \
              --network performance-test-network \
              --volumes-from jenkins \
              justb4/jmeter:latest \
              -n \
              -t /var/jenkins_home/workspace/performance-test/jmeter/ecommerce-api-performance-test.jmx \
              -l /var/jenkins_home/workspace/performance-test/results/results.jtl
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