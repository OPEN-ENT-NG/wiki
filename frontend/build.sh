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
  echo "Example: $0 localDep Use this option to update the edifice-ts-client NPM dependency with a local version"
  echo "Example: $0 build"
  echo "Example: $0 install"
  echo "Example: $0 [--springboard=recette] watch"
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
  rm -rf node_modules 
  rm -rf dist 
  rm -rf build 
  rm -rf .pnpm-store
  # rm -f package.json 
  rm -f pnpm-lock.yaml
}

doInit () {
  node ./scripts/package.cjs

  if [ "$NO_DOCKER" = "true" ] ; then
    pnpm install
  else
    docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "pnpm install"
  fi

}

init() {
  doInit
}

build () {
  if [ "$NO_DOCKER" = "true" ] ; then
    npx nx run-many -t lint test build
  else
    docker-compose run --rm -u "$USER_UID:$GROUP_GID" node sh -c "npx nx run-many -t lint test build"
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