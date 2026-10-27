#!/usr/bin/env bash
# Local preview with live reload: http://localhost:4000
# Save any .md/.html file and the browser refreshes automatically.
cd "$(dirname "$0")"
export PATH="$(ruby -e 'puts Gem.user_dir')/bin:$PATH"
bundle exec jekyll serve --livereload --open-url "$@"
