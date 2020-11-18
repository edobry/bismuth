const
    { sh, gitClone, addToBashrc } = require("./util");

const ruby = {};

ruby.installRbEnv = sh`
    ${gitClone("https://github.com/rbenv/rbenv.git", "~/.rbenv")}
    cd ~/.rbenv && src/configure && make -C src
    ${addToBashrc("export PATH=\"$HOME/.rbenv/bin:$PATH\"")}
    ${addToBashrc("eval \"$(rbenv init -)\"")}
    exec bash
    ${gitClone("https://github.com/rbenv/ruby-build.git", "~/.rbenv/plugins/ruby-build")}
`;

ruby.installRuby = version => sh`
    RUBY_CONFIGURE_OPTS=--with-jemalloc rbenv install ${version}
    rbenv global ${version}
    gem install bundler --no-ri --no-rdoc
`;

ruby.install = version => sh`
    ${ruby.installRbEnv}
    ${ruby.installRuby(version)}
`;

module.exports = ruby;
