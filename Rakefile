task :default => :server

desc 'Build Server Executables'
task :executables do
  sh 'mkdir -p _server'
  sh 'rsync -rtzh ~/repositories/MeshedBuilder/ ./_server'
  sh '_server/Meshed _server/distribute_setup.py'
  sh '_server/Meshed _server/get-pip.py'
  #sh '_server/bin/easy_install --allow-hosts=lxml.de,*.python.org lxml'
end

desc 'Install Server Dependencies'
task :dependencies do
  sh '_server/bin/pip install BeautifulSoup'
  sh '_server/bin/pip install markdown2'
  sh '_server/bin/pip install git+git://github.com/ingydotnet/pyyaml-mirror.git#egg=PyYAML'
  sh '_server/bin/pip install redis'
  sh '_server/bin/pip install git+git://github.com/thepian/thepian-lib.git#egg=thepian-lib'
  sh '_server/bin/pip install git+git://github.com/facebook/tornado'
  sh '_server/bin/pip install git+git://github.com/thepian/thepian-pages.git#egg=thepian-pages'
end

desc 'Build site with Meshed'
task :build do
  jekyll
  lessc 'twothirds'
  lessc 'thirds'
  lessc 'fourths'
  lessc 'pale_serif'
  lessc 'night_sans'
end
 
desc 'Build and start server with --auto'
task :server do
  jekyll '--server --auto'
end

desc 'Build and deploy'
task :deploy => :build do
  sh 'rsync -rtzh --progress --delete _site/ tatey@tatey.com:~/var/www/tatey.com/'
end

def jekyll(opts = '')
  sh 'rm -rf _site'
  sh 'jekyll ' + opts
end

def lessc(base)
  sh 'rm -f css/' + base + '.css'
  sh '(cat less/' + base +'.prefix; lessc -x less/'+ base + '.less)> css/' + base + '.css'
end