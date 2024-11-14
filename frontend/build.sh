#!/bin/bash

# Options
NO_DOCKER=""
for i in "$@"
do
case $i in
  --no-docker*)
  NO_DOCKER="true"
  shift
  ;;
  *)
  ;;
esac
done

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 <clean|init|localDep|build|install|watch>"
  echo "Example: $0 clean"
  echo "Example: $0 init"
  echo "Example: $0 build"
  exit 1
fi

if [[ "$*" == *"--no-user"* ]]
then
  USER_OPTION=""
else
  case `uname -s` in
    MINGW* | Darwin*)
      USER_UID=1000
      GROUP_GID=1000
      ;;
    *)
      if [ -z ${USER_UID:+x} ]
      then
        USER_UID=`id -u`
        GROUP_GID=`id -g`
      fi
  esac
  USER_OPTION="-u $USER_UID:$GROUP_GID"
fi

# options
SPRINGBOARD="recette"
for i in "$@"
do
case $i in
    -s=*|--springboard=*)
    SPRINGBOARD="${i#*=}"
    shift
    ;;
    *)
    ;;
esac
done

clean () {
  rm -rf .nx
  rm -rf node_modules 
  rm -rf dist 
  rm -rf build 
  rm -rf .pnpm-store
  # rm -f package.json 
  rm -f pnpm-lock.yaml
}

init() {
  if [ "$NO_DOCKER" = "true" ] ; then
    pnpm install
  else
    docker-compose run -e NPM_TOKEN -e TIPTAP_PRO_TOKEN --rm $USER_OPTION node sh -c "pnpm install"
  fi
}

build () {
  if [ "$NO_DOCKER" = "true" ] ; then
    pnpm run build
  else
    docker-compose run -e NPM_TOKEN -e TIPTAP_PRO_TOKEN --rm $USER_OPTION node sh -c "pnpm build"
  fi
  status=$?
  if [ $status != 0 ];
  then
    exit $status
  fi
}

for param in "$@"
do
  case $param in
    clean)
      clean
      ;;
    init)
      init
      ;;
    build)
      build
      ;;
    *)
      echo "Invalid argument : $param"
  esac
  if [ ! $? -eq 0 ]; then
    exit 1
  fi
done