require 'aws-sdk'

s3 = Aws::S3::Resource.new(region:'ap-northeast-1')
obj = s3.bucket('bem134-portal-files').object('AAAAAA')
 
# string data
obj.put(body: 'Hello World!')
