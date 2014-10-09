## Construction

<pre>
		gradle clean copyMod
</pre>


## Configuration du module wiki dans le projet ong

Dans le fichier 'ent-core.json.template' du projet ong :

Déclarer l'application wiki dans `"external-modules"` :
<pre>
    {
      "name": "fr.wseduc~wiki~0.1-SNAPSHOT",
      "config": {
        "main" : "fr.wseduc.wiki.Wiki",
        "port" : 8030,
        "app-name" : "Wiki",
        "app-address" : "/wiki",
        "app-icon" : "wiki-large",
        "host": "${host}",
        "ssl" : $ssl,
        "auto-redeploy": false,
        "userbook-host": "${host}",
        "integration-mode" : "HTTP",
        "mode" : "${mode}"
      }
    }
</pre>

Associer une route d'entrée à la configuration du module proxy intégré (`"name": "com.wse~http-proxy~1.0.0"`) :
<pre>
	{
		"location": "/wiki",
		"proxy_pass": "http://localhost:8030"
	}
</pre>

Dans la configuration du module "org.entcore~portal~1.9-SNAPSHOT", ajouter "wiki" à l'array "config.resources-applications".
Cela rend les ressources de l'application Wiki visibles par le linker.
On obtient par exemple :
<pre>
	"resources-applications": [
      	"workspace", "blog", "actualites", "wiki", "pages"
    ]
</pre>


## Documentation
L’organisation générale des pages d'un wiki (du point de vue de l’utilisateur) suit un mode “foisonnement" : les pages sont toutes créées dans un même conteneur, sans organisation hiérarchique.

# Modèle de données - base MongoDB
Les données sont stockées dans la collection "wiki", un wiki étant représenté par un document. 
Un document "wiki" contient essentiellement du HTML (généré par l'éditeur riche) et a une taille limite de 16 Mo.

Exemple de document "wiki" :
	{
		"_id" : "19aaa577-58c2-40f3-92a3-c8b307b8d664",
		"created" : ISODate("2014-07-21T08:59:48.731Z"),
		"index" : "54329007b760276d0a26ffe1",
		"modified" : ISODate("2014-10-06T13:56:26.007Z"),
		"owner" : {
			"userId" : "1e402506-0ab8-420b-a77c-dc887ed6791d",
			"displayName" : "Rachelle PIRES"
		},
		"pages" : [
			{
				"_id" : "54329007b760276d0a26ffe1",
				"title" : "Page principale",
				"content" : "<div class=\"ng-scope\">Bienvenue sur mon wiki</div>",
				"author" : "1e402506-0ab8-420b-a77c-dc887ed6791d",
				"authorName" : "Rachelle PIRES",
				"modified" : ISODate("2014-10-06T12:50:15.657Z")
			},
			{
				"_id" : "54329013b760276d0a26ffe2",
				"author" : "1e402506-0ab8-420b-a77c-dc887ed6791d",
				"authorName" : "Rachelle PIRES",
				"content" : "<div class=\"ng-scope\">Contenu de la première page</div>",
				"modified" : ISODate("2014-10-06T12:50:59.611Z"),
				"title" : "Ma première page"
			}
		],
		"shared" : [
			{
				"userId" : "212e9b3c-91cc-47ca-a441-c6e32b1bf04b",
				"fr-wseduc-wiki-controllers-WikiController|getPage" : true,
				"fr-wseduc-wiki-controllers-WikiController|listPages" : true,
				"fr-wseduc-wiki-controllers-WikiController|updatePage" : true,
				"fr-wseduc-wiki-controllers-WikiController|createPage" : true,
				"fr-wseduc-wiki-controllers-WikiController|deletePage" : true
			},
			{
				"groupId" : "170-1404727939536",
				"fr-wseduc-wiki-controllers-WikiController|getPage" : true,
				"fr-wseduc-wiki-controllers-WikiController|listPages" : true
			}
		],
		"thumbnail" : "/workspace/document/4c42f847-d5ea-4f4a-90cf-5228947520ff",
		"title" : "Mon premier wiki"
	}

Description des champs d'un document de la collection "wiki" :
	{
		"_id" : "identifiant du wiki",
		"created" : "date de création",
		"index" : "identifiant de la page d'accueil du wiki. Ce champ est facultatif",
		"modified" : "date de dernière modification",
		"owner" : {
			"userId" : "identifiant du créateur du wiki",
			"displayName" : "prénom et nom du créateur du wiki
		},
		"pages" : "tableau de pages. Chaque page comporte les champs suivants :
			{
				"_id" : "identifiant de la page. Il est unique dans toute la base",
				"title" : "titre de la page",
				"content" : "contenu de la page, en HTML",
				"author" : "identifiant de l'utilisateur qui a fait la dernière modification",
				"authorName" : "prénom et nom de l'utilisateur qui a fait la dernière modification",
				"modified" : "date de dernière modification de la page"
			}",
		"shared" : "tableau contenant les méthodes partagées avec les autres utilisateurs et/ou groupes",
		"thumbnail" : "chemin vers une miniature du wiki, stockée dans l'application workspace. Ce champ est facultatif",
		"title" : "titre du wiki"
	}

# Gestion des droits
Les droits de type "resource" sont gérés au niveau du wiki, dans l'array "shared".
On en distingue 3 :
	* Lecture ("wiki.read") : consultation d'un wiki
	* Contribution ("wiki.contrib") : création/modification/suppression des pages d'un wiki
	* Gestion ("wiki.manager") : renommer un wiki/modifier l'image d'un wiki, supprimer un wiki, partager un wiki

Il y a 4 droits de type "workflow", les 3 derniers étant nécessaires pour la consultation :
	* "wiki.create" : création d'un wiki
	* 2 droits "wiki.list" : lister les wikis et lister toutes les pages (barre de recherche)
	* "wiki.view" : accès à l'application Wiki


# Modèle de données javascript (model.js)
Le modèle gère une collection (au sens "underscore.js") de wikis, chaque wiki ayant sa collection de pages.

# Liens entre les pages
Les pages peuvent être liées entre elles à l'aide du linker (cf méthodes loadResources et create dans behaviours.js), qui utilise les routes déclarées dans controller.js ("/wiki#/view/:wikiId/:pageId")