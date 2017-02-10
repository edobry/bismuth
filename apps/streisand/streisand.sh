#streisand
#https://github.com/jlund/streisand

#set up ansible
#osx
brew update && brew install ansible
#linux
sudo pip install ansible markupsafe


#install ec2 provisioner
sudo pip install boto

#if on osx
mkdir -p ~/Library/Python/2.7/lib/python/site-packages
echo '/usr/local/lib/python2.7/site-packages' > ~/Library/Python/2.7/lib/python/site-packages/homebrew.pth

#open this pit up
git clone https://github.com/jlund/streisand.git streisand-repo && cd streisand-repo

#lets run this shit
./streisand
