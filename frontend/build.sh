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

if [ -z ${USER_UID:+x} ]
then
  export USER_UID=1000
  export GROUP_GID=1000
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
    docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "pnpm install"
  fi
}

build () {
  if [ "$NO_DOCKER" = "true" ] ; then
    pnpm run build
  else
    docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "pnpm run build"
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