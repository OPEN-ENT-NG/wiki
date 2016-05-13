# À propos de l'application Wiki

* Licence : [AGPL v3](http://www.gnu.org/licenses/agpl.txt) - Copyright Conseil Régional Nord Pas de Calais - Picardie, Conseil départemental de l'Essonne, Conseil régional d'Aquitaine-Limousin-Poitou-Charentes
* Développeur(s) : ATOS
* Financeur(s) : Région Nord Pas de Calais-Picardie,  Département 91, Région Aquitaine-Limousin-Poitou-Charentes
* Description : Application d'édition, de publication et partage de wikis

# Documentation technique
## Construction

<pre>
		gradle clean copyMod
</pre>


## Configuration du module wiki dans le projet ong

Dans le fichier 'ent-core.json.template' du projet ong :

Déclarer l'application wiki dans `"external-modules"` :
<pre>
    {
      "name": "net.atos~wiki~0.1-SNAPSHOT",
      "config": {
        "main" : "net.atos.entng.wiki.Wiki",
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
Les données sont stockées dans deux collections : "wiki" et "wikiRevisions".

Un wiki est représenté par un document de la collection "wiki" : il contient un tableau de pages, et chaque page peut contenir un tableau de commentaires. La taille limite d'un document MongoDB, et donc d'un wiki, est de 16 Mo.

La collection "wikiRevisions" contient quant à elle les différentes versions d'une page de wiki.
Pour chaque version d'une page de wiki, un document est créé dans la collection "wikiRevisions".


Exemple de document de la collection "wiki" :
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
				"title" : "Ma première page",
				"comments" : [
					{
						"_id" : "54f6e9741e621a0664150ebb",
						"comment" : "Mon premier commentaire",
						"author" : "17d95dd8-a06c-4339-b39a-a8804509aa4a",
						"authorName" : "Adèle Henry",
						"created" : ISODate("2015-03-04T11:16:04.656Z")
					},
					{
						"_id" : "54f70dbc1e62b10fa6d7e8af",
						"comment" : "test",
						"author" : "d50da3cd-00e3-4a6a-837c-eb0765ee3c2a",
						"authorName" : "REMI DAUDIER",
						"created" : ISODate("2015-03-04T13:50:52.775Z")
					}
				]
			}
		],
		"shared" : [
			{
				"userId" : "212e9b3c-91cc-47ca-a441-c6e32b1bf04b",
				"net-atos-entng-wiki-controllers-WikiController|getPage" : true,
				"net-atos-entng-wiki-controllers-WikiController|listPages" : true,
				"net-atos-entng-wiki-controllers-WikiController|updatePage" : true,
				"net-atos-entng-wiki-controllers-WikiController|createPage" : true,
				"net-atos-entng-wiki-controllers-WikiController|deletePage" : true
			},
			{
				"groupId" : "170-1404727939536",
				"net-atos-entng-wiki-controllers-WikiController|getPage" : true,
				"net-atos-entng-wiki-controllers-WikiController|listPages" : true
			}
		],
		"thumbnail" : "/workspace/document/4c42f847-d5ea-4f4a-90cf-5228947520ff",
		"title" : "Mon premier wiki"
	}

Description des champs d'un document de la collection "wiki" :
		"_id" : identifiant du wiki
		"created" : date de création du wiki
		"index" : identifiant de la page d'accueil du wiki. Ce champ est facultatif
		"modified" : date de dernière modification
		"owner" : {
			"userId" : identifiant du créateur du wiki
			"displayName" : nom d'affichage du créateur du wiki (par défaut, prénom et nom. Le nom d'affichage peut être modifié)
		}
		"pages" : tableau de pages. Chaque page comporte les champs suivants :
			{
				"_id" : identifiant de la page. Il est unique dans toute la base
				"title" : titre de la page
				"content" : contenu de la page, en HTML
				"author" : identifiant de l'utilisateur qui a fait la dernière modification
				"authorName" : prénom et nom de l'utilisateur qui a fait la dernière modification
				"modified" : date de dernière modification de la page
				"comments" : tableau de commentaires. Chaque commentaire comporte les champs suivants :
					{
						"_id" : identifiant du commentaire. Il est unique dans toute la base
						"comment" : contenu du commentaire
						"author" : identifiant de l'auteur du commentaire
						"authorName" : nom d'affichage de l'auteur du commentaire
						"created" : date de création du commentaire
					}
				]
			}
		"shared" : tableau contenant les méthodes partagées avec les autres utilisateurs et/ou groupes
		"thumbnail" : chemin vers une miniature du wiki, stockée dans l'application workspace. Ce champ est facultatif
		"title" : titre du wiki


Exemple de document de la collection "wikiRevisions" :
	{
		"_id" : "ea0fcf00-6a11-4e02-a006-165e7ea1a192",
		"wikiId" : "1f37077a-81cf-4eb4-8799-46d4db2dbf3d",
		"pageId" : "54dcd2f61e621ddf17347885",
		"userId" : "d50da3cd-00e3-4a6a-837c-eb0765ee3c2a",
		"username" : "REMI DAUDIER",
		"title" : "1ère page",
		"content" : "<p>test</p>",
		"date" : ISODate("2015-02-12T16:21:10.891Z")
	}

Description des champs d'un document de la collection "wikiRevisions" :
		"_id" : identifiant de la révision. Il est unique dans toute la base
		"wikiId" : identifiant du wiki
		"pageId" : identifiant de la page
		"userId" : identifiant de l'auteur de la révision
		"username" : nom d'affichage de l'auteur
		"title" : titre de la page
		"content" : contenu de la page, en HTML
		"date" : date de création de la révision



# Modèle de données javascript (model.js)
Le modèle gère une collection (au sens "underscore.js") de wikis, chaque wiki ayant sa collection de pages.

# Liens entre les pages
Les pages peuvent être liées entre elles à l'aide du linker (cf méthodes loadResources et create dans behaviours.js), qui utilise les routes déclarées dans controller.js ("/wiki#/view/:wikiId/:pageId")
