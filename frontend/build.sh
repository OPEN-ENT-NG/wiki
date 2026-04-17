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
    docker-compose run -e NPM_TOKEN -e TIPTAP_PRO_TOKEN --rm -u "$USER_UID:$GROUP_GID" node sh -c "pnpm install"
  fi
}

build () {
  if [ "$NO_DOCKER" = "true" ] ; then
    pnpm run build
  else
    docker-compose run -e NPM_TOKEN -e TIPTAP_PRO_TOKEN --rm -u "$USER_UID:$GROUP_GID" node sh -c "pnpm build"
  fi
  status=$?
  if [ $status != 0 ];
  then
    exit $status
  fi
}

linkDependencies () {
  # Check if the edifice-frontend-framework directory exists
  if [ ! -d "$PWD/../../edifice-frontend-framework/packages" ]; then
    echo "Directory edifice-frontend-framework/packages does not exist."
    exit 1
  else
    echo "Directory edifice-frontend-framework/packages exists."
  fi


  # # Extract dependencies from package.json using sed
  DEPENDENCIES=$(sed -n '/"dependencies": {/,/}/p' package.json | sed -n 's/ *"@edifice\.io\/\([^"]*\)":.*/\1/p')

  # # Link each dependency if it exists in the edifice-frontend-framework
  for dep in $DEPENDENCIES; do
    # Handle special case for ts-client
    package_path="$PWD/../../edifice-frontend-framework/packages/$dep"

    if [ -d "$package_path" ]; then
      echo "Linking package: $dep"
      (cd "$package_path" && pnpm link --global)
    else
      echo "Package $dep not found in edifice-frontend-framework."
    fi
  done

  # Check if ode-explorer exists in package.json using sed
  if [ -n "$(sed -n '/"ode-explorer":/p' package.json)" ]; then
    echo "ode-explorer found in package.json"
    
    # Check if explorer frontend path exists
    if [ -d "$PWD/../../explorer/frontend" ]; then
      echo "explorer/frontend directory exists"
      echo "Linking ode-explorer globally..."
      (cd "$PWD/../../explorer/frontend" && pnpm link --global)
      pnpm link --global ode-explorer
    else
      echo "explorer/frontend directory not found"
      exit 1
    fi
  else
    echo "ode-explorer not found in package.json"
  fi

  # # Link the packages in the current application
  echo "Linking packages in the current application..."
  Link each dependency from package.json
  for dep in $DEPENDENCIES; do
    pnpm link --global "@edifice.io/$dep"
  done

  echo "All specified packages have been linked successfully."
}

cleanDependencies() {
  rm -rf node_modules && rm -f pnpm-lock.yaml && pnpm install
}


publishNPM () {
  echo "[publish] Publish package..."

  # Récupération de la branche locale
  LOCAL_BRANCH=`echo $GIT_BRANCH | sed -e "s|origin/||g"`
  # Récupération de la date et du timestamp
  TIMESTAMP=`date +%Y%m%d%H%M%S`
  # Récupération du dernier tag stable
  LATEST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "1.0.0")
  LATEST_TAG=${LATEST_TAG#v}

  # Définition du tag de la branche
  if [ "$LOCAL_BRANCH" = "master" ]; then
    TAG_BRANCH="latest"
  else
    TAG_BRANCH=$LOCAL_BRANCH
  fi


  # Création de la nouvelle version
  if [ "$LOCAL_BRANCH" = "master" ]; then
    NEW_VERSION="$LATEST_TAG"
  else
    # Mettre à jour la version dans tous les packages avec la version exacte
    NEW_VERSION="$LATEST_TAG-$LOCAL_BRANCH.$TIMESTAMP"
    echo "[publish] Update version with the exact version"
    docker compose run -e NPM_TOKEN=$NPM_TOKEN --rm -u "$USER_UID:$GROUP_GID" node sh -c "pnpm exec npm version $NEW_VERSION --no-git-tag-version"
  fi
  
  docker compose run -e NPM_TOKEN=$NPM_PUBLIC_TOKEN --rm -u "$USER_UID:$GROUP_GID" node sh -c "pnpm publish --no-git-checks --access public --tag $TAG_BRANCH"
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
    linkDependencies)
      linkDependencies
      ;;
    cleanDependencies)
      cleanDependencies
      ;;
    publishNPM)
      publishNPM
      ;;
    *)
      echo "Invalid argument : $param"
  esac
  if [ ! $? -eq 0 ]; then
    exit 1
  fi
done