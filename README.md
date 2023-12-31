
# Project Title

A brief description of what this project does and who it's for

Description:  This AWS Cloudformation template deploys a 3-tier architecture in the us-east-1 region

Parameters:
  EnvironmentName:
    Description: An environment name that is prefixed to resource names
    Type: String
    Default: 3-Tier

  KeyPair:
    Description: Please enter the name of the SSH Key Pair for remote access to EC2 instances
    Type: String
    Default: cloud-formation

  DatabaseName:
    Description: Please enter the name of the MySQL database
    Type: String
    Default: demo-database-2312478

  MasterUsername:
    Description: Please enter the Master Username for the RDS Database
    Type: String
    Default: admin

  MasterUserPassword:
    Description: Please enter the Master Password for the RDS Database
    Type: String
    Default: 

  MySQLDBSubnetGroupName:
    Description: Please enter name for RDS Database Instance Subnet Group
    Type: String
    Default: MySQLDBSubnetGroup-2312478
  
  VpcCIDR:
    Description: Please enter the IP range (CIDR notation) for this VPC
    Type: String
    Default: 10.100.0.0/16

  PublicSubnet1CIDR:
    Description: Please enter the IP range (CIDR notation) for the private subnet in the first Availability Zone
    Type: String
    Default: 10.100.1.0/24
  
  PublicSubnet2CIDR:
    Description: Please enter the IP range (CIDR notation) for the private subnet in the second Availability Zone
    Type: String
    Default: 10.100.2.0/24

  PublicSubnet3CIDR:
    Description: Please enter the IP range (CIDR notation) for the private subnet in the second Availability Zone
    Type: String
    Default: 10.100.3.0/24

  PrivateSubnet1CIDR:
    Description: Please enter the IP range (CIDR notation) for the public subnet in the first Availability Zone
    Type: String
    Default: 10.100.11.0/24

  PrivateSubnet2CIDR:
    Description: Please enter the IP range (CIDR notation) for the public subnet in the second Availability Zone
    Type: String
    Default: 10.100.12.0/24

  PrivateSubnet3CIDR:
    Description: Please enter the IP range (CIDR notation) for the public subnet in the third Availability Zone
    Type: String
    Default: 10.100.13.0/24

  PrivateSubnet4CIDR:
    Description: Please enter the IP range (CIDR notation) for the public subnet in the third Availability Zone
    Type: String
    Default: 10.100.14.0/24

Resources:
  VPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: !Ref VpcCIDR
      EnableDnsSupport: true
      EnableDnsHostnames: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-VPC

  InternetGateway:
    Type: AWS::EC2::InternetGateway
    DependsOn: VPC
    Properties:
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-InternetGateway

  InternetGatewayAttachment:
    Type: AWS::EC2::VPCGatewayAttachment
    DependsOn: InternetGateway
    Properties:
      InternetGatewayId: !Ref InternetGateway
      VpcId: !Ref VPC

  PublicSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [ 0, !GetAZs  '' ]
      CidrBlock: !Ref PublicSubnet1CIDR
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Public-Web-Subnet-(AZ1)

  PublicSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [ 1, !GetAZs  '' ]
      CidrBlock: !Ref PublicSubnet2CIDR
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Public-Web-Subnet-(AZ2)

  PublicSubnet3:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [ 2, !GetAZs  '' ]
      CidrBlock: !Ref PublicSubnet3CIDR
      MapPublicIpOnLaunch: true
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Public-Web-Subnet-(AZ3)

  PrivateSubnet1:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [ 0, !GetAZs '' ]
      CidrBlock: !Ref PrivateSubnet1CIDR
      MapPublicIpOnLaunch: false
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Private-App-Subnet-(AZ1)

  PrivateSubnet2:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [ 1, !GetAZs  '' ]
      CidrBlock: !Ref PrivateSubnet2CIDR
      MapPublicIpOnLaunch: false
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Private-App-Subnet-(AZ2)

  PrivateSubnet3:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [ 0, !GetAZs  '' ]
      CidrBlock: !Ref PrivateSubnet3CIDR
      MapPublicIpOnLaunch: false
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Private-Data-Subnet-(AZ1)

  PrivateSubnet4:
    Type: AWS::EC2::Subnet
    Properties:
      VpcId: !Ref VPC
      AvailabilityZone: !Select [ 1, !GetAZs  '' ]
      CidrBlock: !Ref PrivateSubnet4CIDR
      MapPublicIpOnLaunch: false
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-Private-Data-Subnet-(AZ2)
  
  NATElasticIP:
    Type: AWS::EC2::EIP
    Properties:
      Domain: vpc
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-ElasticIP

  NatGateway:
    Type: AWS::EC2::NatGateway
    DependsOn: PublicSubnet1
    Properties:
      ConnectivityType: public
      AllocationId: !GetAtt NATElasticIP.AllocationId
      SubnetId: !GetAtt PublicSubnet1.SubnetId
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-NatGateway
  
  PublicRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC
      Tags:
        - Key: Name
          Value: !Sub ${EnvironmentName}-PublicRouteTable

  DefaultPublicRoute:
    Type: AWS::EC2::Route
    DependsOn: InternetGatewayAttachment
    Properties:
      RouteTableId: !Ref PublicRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      GatewayId: !Ref InternetGateway

  PublicSubnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    DependsOn: DefaultPublicRoute
    Properties:
      RouteTableId: !Ref PublicRouteTable
      SubnetId: !Ref PublicSubnet1

  PublicSubnet2RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    DependsOn: DefaultPublicRoute
    Properties:
      RouteTableId: !Ref PublicRouteTable
      SubnetId: !Ref PublicSubnet2

  PublicSubnet3RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    DependsOn: DefaultPublicRoute
    Properties:
      RouteTableId: !Ref PublicRouteTable
      SubnetId: !Ref PublicSubnet3

  PrivateRouteTable:
    Type: AWS::EC2::RouteTable
    Properties:
      VpcId: !Ref VPC
      Tags:
       - Key: Name
         Value: !Sub ${EnvironmentName}-PrivateRouteTable

  DefaultPrivateRoute:
    Type: AWS::EC2::Route
    DependsOn: NatGateway
    Properties:
      RouteTableId: !Ref PrivateRouteTable
      DestinationCidrBlock: 0.0.0.0/0
      NatGatewayId: !Ref NatGateway

  PrivateSubnet1RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    DependsOn: DefaultPrivateRoute
    Properties:
      RouteTableId: !Ref PrivateRouteTable
      SubnetId: !Ref PrivateSubnet1

  PrivateSubnet2RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    DependsOn: DefaultPrivateRoute
    Properties:
      RouteTableId: !Ref PrivateRouteTable
      SubnetId: !Ref PrivateSubnet2

  PrivateSubnet3RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    DependsOn: DefaultPrivateRoute
    Properties:
      RouteTableId: !Ref PrivateRouteTable
      SubnetId: !Ref PrivateSubnet3

  PrivateSubnet4RouteTableAssociation:
    Type: AWS::EC2::SubnetRouteTableAssociation
    DependsOn: DefaultPrivateRoute
    Properties:
      RouteTableId: !Ref PrivateRouteTable
      SubnetId: !Ref PrivateSubnet4

  BastionHostSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    DependsOn: VPC
    Properties:
      GroupName: !Sub ${EnvironmentName}-BastionHost-SecurityGroup
      GroupDescription: "Security group for Bastion Host"
      VpcId: !Ref VPC

  BastionHostSecurityGroupSSHIngress:
    Type: AWS::EC2::SecurityGroupIngress   
    DependsOn: BastionHostSecurityGroup
    Properties:
      CidrIp: 0.0.0.0/0
      Description: "Allow SSH from local machine"
      GroupId: !Ref BastionHostSecurityGroup
      IpProtocol: tcp
      FromPort: 22
      ToPort: 22
  
  WebTierLBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupName: !Sub ${EnvironmentName}-WebTierLB-SecurityGroup
      GroupDescription: "Security group for Web Tier Load Balancer"
      VpcId: !Ref VPC

  WebTierLBSecurityGroupHTTPIngress:
    Type: AWS::EC2::SecurityGroupIngress   
    DependsOn: WebTierLBSecurityGroup
    Properties:
      CidrIp: 0.0.0.0/0
      Description: "Allow HTTP from anywhere"
      GroupId: !Ref WebTierLBSecurityGroup
      IpProtocol: tcp
      FromPort: 80
      ToPort: 80

  WebTierSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    DependsOn: BastionHostSecurityGroup
    Properties:
      GroupName: !Sub ${EnvironmentName}-WebTier-SecurityGroup
      GroupDescription: "Security group for Web Tier"
      VpcId: !Ref VPC

  WebTierSecurityGroupHTTPIngress:
    Type: AWS::EC2::SecurityGroupIngress   
    DependsOn: WebTierLBSecurityGroup
    Properties:
      SourceSecurityGroupId: !GetAtt WebTierLBSecurityGroup.GroupId
      Description: "Allow HTTP from Web Tier Load Balancer"
      GroupId: !Ref WebTierSecurityGroup
      IpProtocol: tcp
      FromPort: 80
      ToPort: 80

  WebTierSecurityGroupSSHIngress:
    Type: AWS::EC2::SecurityGroupIngress   
    DependsOn: BastionHostSecurityGroup
    Properties:
      SourceSecurityGroupId: !GetAtt BastionHostSecurityGroup.GroupId
      Description: "Allow SSH from Bastion Host"
      GroupId: !GetAtt WebTierSecurityGroup.GroupId
      IpProtocol: tcp
      FromPort: 22
      ToPort: 22

  AppTierLBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupName: !Sub ${EnvironmentName}-AppTierLB-SecurityGroup
      GroupDescription: "Security group for App Tier Load Balancer"
      VpcId: !Ref VPC

  AppTierLBSecurityGroupHTTPIngress:
    Type: AWS::EC2::SecurityGroupIngress   
    DependsOn: AppTierLBSecurityGroup
    Properties:
      CidrIp: 0.0.0.0/0
      Description: "Allow HTTP from anywhere"
      GroupId: !Ref AppTierLBSecurityGroup
      IpProtocol: tcp
      FromPort: 80
      ToPort: 80

  AppTierSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    DependsOn: WebTierSecurityGroup
    Properties:
      GroupName: !Sub ${EnvironmentName}-AppTier-SecurityGroup
      GroupDescription: "Security group for App Tier"
      VpcId: !Ref VPC

  AppTierSecurityGroupHTTPIngress:
    Type: AWS::EC2::SecurityGroupIngress   
    DependsOn: AppTierSecurityGroup
    Properties:
      CidrIp: 0.0.0.0/0
      Description: "Allow HTTP from Web Tier Load Balancer"
      GroupId: !GetAtt AppTierSecurityGroup.GroupId
      IpProtocol: tcp
      FromPort: 80
      ToPort: 80

  AppTierSecurityGroupSSHIngress:
    Type: AWS::EC2::SecurityGroupIngress   
    DependsOn: AppTierSecurityGroup
    Properties:
      SourceSecurityGroupId: !GetAtt BastionHostSecurityGroup.GroupId
      Description: "Allow SSH from Bastion Host"
      GroupId: !GetAtt AppTierSecurityGroup.GroupId
      IpProtocol: tcp
      FromPort: 22
      ToPort: 22

  DatabaseSecurityGroup:
    Type: AWS::RDS::DBSecurityGroup
    DependsOn: AppTierSecurityGroup
    Properties: 
      DBSecurityGroupIngress: 
        - EC2SecurityGroupId: !GetAtt AppTierSecurityGroup.GroupId
        - EC2SecurityGroupId: !GetAtt BastionHostSecurityGroup.GroupId
      EC2VpcId: !Ref VPC
      GroupDescription: "Security Group for Database Tier"
      Tags: 
        - Key: Name
          Value: !Sub ${EnvironmentName}-DataTier-SecurityGroup

  BastionHost:
    Type: AWS::EC2::Instance
    DependsOn: BastionHostSecurityGroup
    Properties:
      ImageId: ami-093467ec28ae4fe03
      KeyName: !Ref KeyPair
      InstanceType: t2.micro
      NetworkInterfaces:
        - DeviceIndex: 0
          AssociatePublicIpAddress: true
          SubnetId: !GetAtt PublicSubnet3.SubnetId
          GroupSet:
            - !GetAtt BastionHostSecurityGroup.GroupId
      Tags: 
        - Key: Name
          Value: !Sub ${EnvironmentName}-BastionHost
      UserData: 
        Fn::Base64: 
          !Sub |
            #!/bin/bash
            yum update -y
            yum install -y nmap
  
  WebTierLaunchTemplate:
    Type: AWS::EC2::LaunchTemplate
    DependsOn: 
      - WebTierSecurityGroup
      - AppTierApplicationLoadBalancer
    Properties:
      LaunchTemplateName: !Sub ${EnvironmentName}-WebTier-LaunchTemplate
      LaunchTemplateData:
        ImageId: ami-093467ec28ae4fe03
        InstanceType: t2.micro
        KeyName: !Ref KeyPair
        NetworkInterfaces:
          - DeviceIndex: 0
            AssociatePublicIpAddress: true
            Groups:
              - !Ref WebTierSecurityGroup
        UserData: 
          Fn::Base64: !Sub
            - |
              #!/bin/bash
              sudo yum update -y
              sudo yum install -y nginx
              sudo systemctl start nginx
              sudo systemctl enable nginx
              cd /home/ec2-user
              sudo yum install -y git
              git clone https://github.com/nasinghn/cloud-formation.git
              sudo cp -r /home/ec2-user/cloud-formation/html/* /usr/share/nginx/html/
              sudo sed -i "s/localhost/${AppTierLoadBalancerURL}/" /usr/share/nginx/html/index.html
              sudo systemctl restart nginx
            - AppTierLoadBalancerURL: !GetAtt AppTierApplicationLoadBalancer.DNSName
  #           aws s3 cp s3://ecommerce-2312478/index.html /var/www/html/ --recursive
  #            EC2AZ=$(curl -s http://169.254.169.254/latest/meta-data/placement/availability-zone)
  #            echo '<center><h1>This Amazon EC2 instance is located in Availability Zone: AZID </h1></center>' > /var/www/html/index.txt
  #            sed "s/AZID/$EC2AZ/" /var/www/html/index.txt > /var/www/html/index.html
           
  WebTierApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    DependsOn: InternetGatewayAttachment
    Properties:
      Name: !Sub ${EnvironmentName}-WebTier-LoadBalancer
      Type: application
      IpAddressType: ipv4
      Scheme: internet-facing
      SecurityGroups: 
        - !GetAtt WebTierLBSecurityGroup.GroupId
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  WebTierTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties: 
      Name: !Sub ${EnvironmentName}-WebTier-TargetGroup
      HealthCheckIntervalSeconds: 30
      HealthCheckPath: /
      Port: 80
      Protocol: HTTP
      HealthyThresholdCount: 5
      UnhealthyThresholdCount: 2
      TargetType: instance
      Matcher: 
        HttpCode: "200"
      VpcId: !Ref VPC
  
  WebTierHTTPListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    DependsOn: WebTierTargetGroup
    Properties:
      LoadBalancerArn: !Ref WebTierApplicationLoadBalancer
      Port: 80
      Protocol: HTTP
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref WebTierTargetGroup
      
  WebTierAutoScalingGroup:
    Type: AWS::AutoScaling::AutoScalingGroup
    DependsOn: WebTierLaunchTemplate
    Properties:
      AutoScalingGroupName: !Sub ${EnvironmentName}-WebTier-AutoScaleGroup
      DesiredCapacity: 1
      MinSize: 1
      MaxSize: 2
      LaunchTemplate: 
        LaunchTemplateId: !Ref WebTierLaunchTemplate
        Version: !GetAtt WebTierLaunchTemplate.LatestVersionNumber
      TargetGroupARNs: 
        - !Ref WebTierTargetGroup
      VPCZoneIdentifier:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  AppTierLaunchTemplate:
    Type: AWS::EC2::LaunchTemplate
    DependsOn: 
      - AppTierSecurityGroup
      - MySQLDatabase
    Properties:
      LaunchTemplateName: !Sub ${EnvironmentName}-AppTier-LaunchTemplate
      LaunchTemplateData:
        ImageId: ami-093467ec28ae4fe03
        IamInstanceProfile:
          Ref: Tier3InstanceRole 
        InstanceType: t2.micro
        KeyName: !Ref KeyPair
        NetworkInterfaces:
          - DeviceIndex: 0
            AssociatePublicIpAddress: true
            Groups:
              - !Ref AppTierSecurityGroup
        UserData: 
          Fn::Base64: !Sub
            - |
              #!/bin/bash
              sudo yum update -y
              sudo yum install -y ruby
              sudo wget https://aws-codedeploy-eu-central-1.s3.amazonaws.com/latest/install
              sudo chmod +x ./install
              sudo ./install auto
              sudo service codedeploy-agent start
              sudo yum install -y gcc-c++ make
              sudo curl --silent --location https://rpm.nodesource.com/setup_14.x | sudo bash -
              sudo yum install -y nodejs
              cd /home/ec2-user
              sudo yum install -y git
              git clone https://github.com/nasinghn/cloud-formation.git
              cd /home/ec2-user/cloud-formation/nodejs
              npm install
              npm install -g pm2
              sudo nohup /usr/local/bin/node index.js &
              sudo echo ${MyRDSEndpointOutput} > /tmp/test.txt
              sudo sed -i  "s/.*host.*/    host: '${MyRDSEndpointOutput}',/" /home/ec2-user/cloud-formation/nodejs/index.js
              sudo rpm --import https://repo.mysql.com/RPM-GPG-KEY-mysql-2022
              sudo wget https://dev.mysql.com/get/mysql57-community-release-el7-11.noarch.rpm
              sudo yum localinstall -y mysql57-community-release-el7-11.noarch.rpm 
              sudo yum install -y mysql-community-client
              sudo mysql -h ${MyRDSEndpointOutput} -u admin -psanjay12 < /home/ec2-user/cloud-formation/tier3.sql
            - MyRDSEndpointOutput: !GetAtt MySQLDatabase.Endpoint.Address
      #        echo '<center><h1>This is the Application tier! </h1></center>' > /var/www/html/index.html

  AppTierApplicationLoadBalancer:
    Type: AWS::ElasticLoadBalancingV2::LoadBalancer
    DependsOn: 
      - AppTierLBSecurityGroup
      - InternetGatewayAttachment
    Properties:
      Name: !Sub ${EnvironmentName}-AppTier-LoadBalancer
      Type: application
      IpAddressType: ipv4
      Scheme: internet-facing
      SecurityGroups: 
        - !GetAtt AppTierLBSecurityGroup.GroupId
      Subnets:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  AppTierTargetGroup:
    Type: AWS::ElasticLoadBalancingV2::TargetGroup
    Properties: 
      Name: !Sub ${EnvironmentName}-AppTier-TargetGroup
      HealthCheckIntervalSeconds: 30
      HealthCheckPath: /
      Port: 80
      Protocol: HTTP
      HealthyThresholdCount: 5
      UnhealthyThresholdCount: 2
      TargetType: instance
      Matcher: 
        HttpCode: "200"
      VpcId: !Ref VPC
  
  AppTierHTTPListener:
    Type: AWS::ElasticLoadBalancingV2::Listener
    DependsOn: AppTierTargetGroup
    Properties:
      LoadBalancerArn: !Ref AppTierApplicationLoadBalancer
      Port: 80
      Protocol: HTTP
      DefaultActions:
        - Type: forward
          TargetGroupArn: !Ref AppTierTargetGroup

  AppTierAutoScalingGroup:
    Type: AWS::AutoScaling::AutoScalingGroup
    DependsOn: AppTierLaunchTemplate
    Properties:
      AutoScalingGroupName: !Sub ${EnvironmentName}-AppTier-AutoScaleGroup
      DesiredCapacity: 1
      MinSize: 1
      MaxSize: 2
      LaunchTemplate: 
        LaunchTemplateId: !Ref AppTierLaunchTemplate
        Version: !GetAtt AppTierLaunchTemplate.LatestVersionNumber
      TargetGroupARNs: 
        - !Ref AppTierTargetGroup
      VPCZoneIdentifier:
        - !Ref PublicSubnet1
        - !Ref PublicSubnet2

  MySQLDBSubnetGroup:
    Type: AWS::RDS::DBSubnetGroup
    Properties: 
      DBSubnetGroupDescription: "Subnets for MySQL RDS Instances"
      DBSubnetGroupName: !Ref MySQLDBSubnetGroupName
      SubnetIds: 
        - !GetAtt PrivateSubnet3.SubnetId
        - !GetAtt PrivateSubnet4.SubnetId
  
  MySQLDatabase:
    Type: AWS::RDS::DBInstance
    DependsOn: MySQLDBSubnetGroup
    Properties:
      Engine: mysql
      EngineVersion: 8.0.33
      DBInstanceIdentifier: !Ref DatabaseName
      DBSecurityGroups: 
        - !Ref DatabaseSecurityGroup
      DBSubnetGroupName: !Ref MySQLDBSubnetGroup
      MasterUsername: !Ref MasterUsername
      MasterUserPassword: !Ref MasterUserPassword
      DBInstanceClass: db.t3.micro
      MultiAZ: false
      AllocatedStorage: 20

Outputs:
  BastionHostPIP:
    Description: The Public IP Address of the Bastion Host
    Value: !GetAtt BastionHost.PublicIp  
  WebTierLoadBalancerURL:
    Description: The URL of the Web Tier Application Load Balancer
    Value: !GetAtt WebTierApplicationLoadBalancer.DNSName
  AppTierLoadBalancerURL:
    Description: The URL of the App Tier Application Load Balancer
    Value: !GetAtt AppTierApplicationLoadBalancer.DNSName
  MySQLDatabaseEndpointAddress:
    Description: The FQDN of the MySQL Database
    Value: !GetAtt MySQLDatabase.Endpoint.Address
  MySQLDatabasePort:
    Description: The TCP port of the MySQL Database
    Value: !GetAtt MySQLDatabase.Endpoint.Port
  # Exported security group ID for RDS access.
  RDSAccessSecurityGroupOutput:
    Description: Security Group ID for RDS Access
    Value: !Ref DatabaseSecurityGroup
    Export:
      Name: RDSAccessSecurityGroupOutput

  # Exported master user password for the RDS instance.
  MyMasterUserPasswordOutput:
    Description: The master user password for the RDS instance.
    Value: !Ref MasterUserPassword
    Export:
      Name: MasterUserPassword

  # Exported master username for the RDS instance.
  MyMasterUsernameOutput:
    Description: The master user name for the RDS instance.
    Value: !Ref MasterUsername
    Export:
      Name: MasterUsername
  # Exported RDS endpoint for the RDS instance.
  MyRDSEndpointOutput:
    Description: The RDS Endpoint for the RDS instance.
    Value: !GetAtt MySQLDatabase.Endpoint.Address
    Export:
      Name: MyRDSEndpoint
