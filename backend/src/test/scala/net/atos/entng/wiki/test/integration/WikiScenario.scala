package net.atos.entng.wiki.test.integration

import io.gatling.core.Predef._
import io.gatling.http.Predef._

import org.entcore.test.appregistry.Role

object WikiScenario {

  // Teacher creates, reads and updates a wiki
  val scn =
    Role.createAndSetRole("Wiki")
      .exec(http("Login - teacher")
        .post("""/auth/login""")
        .formParam("""email""", """${teacherLogin}""")
        .formParam("""password""", """blipblop""")
        .check(status.is(302)))

      .exec(http("Create wiki")
        .post("/wiki")
        .body(StringBody("""{"title" : "Mon premier wiki"}"""))
        // .formParam("thumbnail", "/TODO/path/to/wiki.png")
        .check(status.is(200), jsonPath("$._id").find.saveAs("wikiId")))
      .exec(http("List wikis")
        .get("/wiki/list")
        .check(status.is(200)))

      .exec(http("Create page")
        .post("/wiki/${wikiId}/page")
        .body(StringBody("""
            {"title" : "Ma première page", 
            "content" : "Contenu de ma page"}
            """))
        .check(status.is(200), jsonPath("$._id").find.saveAs("pageId")))
      .exec(http("Create page2")
        .post("/wiki/${wikiId}/page")
        .body(StringBody("""
            {"title" : "Ma seconde page", 
            "content" : "Contenu de ma 2nde page"}
            """))
        .check(status.is(200), jsonPath("$._id").find.saveAs("secondPageId")))
      .exec(http("List pages")
        .get("/wiki/${wikiId}/listpages")
        .check(status.is(200)))

      .exec(http("Update wiki")
        .put("/wiki/${wikiId}")
        .body(StringBody("""{"title" : "Mon 1er wiki v2"}"""))
        // .formParam("thumbnail", "/TODO/path/to/new/picture/wiki.png")
        .check(status.is(200), jsonPath("$.number").is("1")))

      .exec(http("Get page before update")
        .get("/wiki/${wikiId}/page/${pageId}")
        .check(status.is(200), jsonPath("$.pages[0].title").is("Ma première page"),
          jsonPath("$.pages[0].content").is("Contenu de ma page"),
          jsonPath("$.pages[0]._id").is("${pageId}"),
          jsonPath("$._id").is("${wikiId}")))
      .exec(http("Update page 1")
        .put("/wiki/${wikiId}/page/${pageId}")
        .body(StringBody("""
            {"title" : "Ma première page v1.1", 
            "content" : "Contenu de ma page mis à jour"}
            """))
        .check(status.is(200), jsonPath("$.number").is("1")))
      .exec(http("Get page after update")
        .get("/wiki/${wikiId}/page/${pageId}")
        .check(status.is(200), jsonPath("$.pages[0].title").is("Ma première page v1.1"),
          jsonPath("$.pages[0].content").is("Contenu de ma page mis à jour"),
          jsonPath("$.pages[0]._id").is("${pageId}"),
          jsonPath("$._id").is("${wikiId}")))

      .exec(http("Logout - teacher")
        .get("""/auth/logout""")
        .check(status.is(302)))

  // Student tries to access wiki created by teacher
  val scnAccessNonSharedWiki =
    exec(http("Login - student")
      .post("""/auth/login""")
      .formParam("""email""", """${studentLogin}""")
      .formParam("""password""", """blipblop""")
      .check(status.is(302)))

      // student can not see the wiki created by teacher
      .exec(http("List wikis")
        .get("/wiki/list")
        .check(status.is(200)))
      .exec(http("List all pages")
        .get("/wiki/listallpages")
        .check(status.is(200)))

      // unauthorized actions on wiki created by teacher
      .exec(http("List pages")
        .get("/wiki/${wikiId}/listpages")
        .check(status.is(401)))
      .exec(http("Get page 1")
        .get("/wiki/${wikiId}/page/${pageId}")
        .check(status.is(401)))
      .exec(http("Create page")
        .post("/wiki/${wikiId}/page")
        .body(StringBody("""
            {"title" : "Ma page", 
            "content" : "Contenu"}
            """))
        .check(status.is(401)))

      .exec(http("Update wiki")
        .put("/wiki/${wikiId}")
        .body(StringBody("""{"title" : "Mon 1er wiki v3"}"""))
        .check(status.is(401)))
      .exec(http("Update page 2")
        .put("/wiki/${wikiId}/page/${pageId}")
        .body(StringBody("""
            {"title" : "Ma première page v3", 
            "content" : "Contenu de ma page mis à jour v3"}
            """))
        .check(status.is(401)))

//      .exec(http("Delete page")
//        .delete("/wiki/${wikiId}/page/${pageId}")
//        .check(status.is(401)))
      .exec(http("Delete wiki")
        .delete("/wiki/${wikiId}")
        .check(status.is(401)))

      .exec(http("Logout - student")
        .get("""/auth/logout""")
        .check(status.is(302)))

  val scnAccessReadOnlyWiki = exec(http("Login - teacher")
    .post("""/auth/login""")
    .formParam("""email""", """${teacherLogin}""")
    .formParam("""password""", """blipblop""")
    .check(status.is(302)))
    .exec(http("List rights")
      .get("/wiki/share/json/${wikiId}")
      .check(status.is(200)
//       ,jsonPath("$.actions[?(@.displayName == 'wiki.read')].name").find.saveAs("wikiReadRights"),
//        jsonPath("$.actions[?(@.displayName == 'wiki.contrib')].name").find.saveAs("wikiContribRights"),
//        jsonPath("$.actions[?(@.displayName == 'wiki.manage')].name").find.saveAs("wikiManageRights")
        )) 
    .exec(http("Share right 'wiki.read' with Student as a Person")
      .put("/wiki/share/json/${wikiId}")
      .bodyPart(StringBodyPart("userId", "${studentId}"))
      .bodyPart(StringBodyPart("actions", "net-atos-entng-wiki-controllers-WikiController|getPage"))
      .bodyPart(StringBodyPart("actions", "net-atos-entng-wiki-controllers-WikiController|listPages"))
      .check(status.is(200)))
    .exec(http("Logout - teacher")
      .get("""/auth/logout""")
      .check(status.is(302)))

    .exec(http("Login - student")
      .post("""/auth/login""")
      .formParam("""email""", """${studentLogin}""")
      .formParam("""password""", """blipblop""")
      .check(status.is(302)))

    // authorized actions
    .exec(http("List wikis")
      .get("/wiki/list")
      .check(status.is(200)))
    .exec(http("List all pages")
        .get("/wiki/listallpages")
        .check(status.is(200)))
    .exec(http("List pages")
      .get("/wiki/${wikiId}/listpages")
      .check(status.is(200)))
    .exec(http("Get page")
      .get("/wiki/${wikiId}/page/${pageId}")
      .check(status.is(200)))
      
    // unauthorized actions on wiki created by teacher
    .exec(http("Create page")
      .post("/wiki/${wikiId}/page")
      .body(StringBody("""
            {"title" : "Ma page", 
            "content" : "Contenu"}
            """))
      .check(status.is(401)))
    .exec(http("Update wiki")
      .put("/wiki/${wikiId}")
      .body(StringBody("""{"title" : "Mon 1er wiki v3"}"""))
      .check(status.is(401)))
    .exec(http("Update page")
      .put("/wiki/${wikiId}/page/${pageId}")
      .body(StringBody("""
            {"title" : "Ma première page v3",
            "content" : "Contenu de ma page mis à jour v3"}
            """))
      .check(status.is(401)))
//    .exec(http("Delete page")
//      .delete("/wiki/${wikiId}/page/${pageId}")
//      .check(status.is(401)))
    .exec(http("Delete wiki")
      .delete("/wiki/${wikiId}")
      .check(status.is(401)))

    .exec(http("Logout - student")
      .get("""/auth/logout""")
      .check(status.is(302)))

  val scnContributeToWiki = exec(http("Login - teacher").post("""/auth/login""")
    .formParam("""email""", """${teacherLogin}""")
    .formParam("""password""", """blipblop""")
    .check(status.is(302)))
    .exec(http("Share right 'wiki.contrib' with Student as a Person")
      .put("/wiki/share/json/${wikiId}")
      .bodyPart(StringBodyPart("userId", "${studentId}"))
      .bodyPart(StringBodyPart("actions", "net-atos-entng-wiki-controllers-WikiController|createPage"))
      .bodyPart(StringBodyPart("actions", "net-atos-entng-wiki-controllers-WikiController|updatePage"))
      .check(status.is(200)))
    .exec(http("Logout - teacher")
      .get("""/auth/logout""")
      .check(status.is(302)))

    .exec(http("Login - student")
      .post("""/auth/login""")
      .formParam("""email""", """${studentLogin}""")
      .formParam("""password""", """blipblop""")
      .check(status.is(302)))

    // authorized actions
    .exec(http("List wikis")
      .get("/wiki/list")
      .check(status.is(200)))
    .exec(http("List pages")
      .get("/wiki/${wikiId}/listpages")
      .check(status.is(200)))
    .exec(http("Get page 2")
      .get("/wiki/${wikiId}/page/${pageId}")
      .check(status.is(200)))

    .exec(http("Create page")
      .post("/wiki/${wikiId}/page")
      .body(StringBody("""
            {"title" : "Ma page", 
            "content" : "Contenu"}
            """))
      .check(status.is(200), jsonPath("$._id").find.saveAs("studentPageId")))
    .exec(http("List pages after page creation")
      .get("/wiki/${wikiId}/listpages")
      .check(status.is(200)))
//    .exec(http("Delete page")
//      .delete("/wiki/${wikiId}/page/${studentPageId}")
//      .check(status.is(200)))
    .exec(http("List pages after page deletion")
      .get("/wiki/${wikiId}/listpages")
      .check(status.is(200)))

    .exec(http("Update page")
      .put("/wiki/${wikiId}/page/${pageId}")
      .body(StringBody("""
            {"title" : "Ma première page v3", 
            "content" : "Contenu de ma page mis à jour v3"}
            """))
      .check(status.is(200), jsonPath("$.number").is("1")))

    // unauthorized actions on wiki created by teacher
    .exec(http("Update wiki")
      .put("/wiki/${wikiId}")
      .body(StringBody("""{"title" : "Mon 1er wiki v3"}"""))
      .check(status.is(401)))
    .exec(http("Delete wiki")
      .delete("/wiki/${wikiId}")
      .check(status.is(401)))

    .exec(http("Logout - student")
      .get("""/auth/logout""")
      .check(status.is(302)))

  val scnManageWikiAndCleanData = exec(http("Login - teacher").post("""/auth/login""")
    .formParam("""email""", """${teacherLogin}""")
    .formParam("""password""", """blipblop""")
    .check(status.is(302)))
    .exec(http("Share right 'wiki.manager' with Student as a Person")
      .put("/wiki/share/json/${wikiId}")
      .bodyPart(StringBodyPart("userId", "${studentId}"))
      .bodyPart(StringBodyPart("actions", "net-atos-entng-wiki-controllers-WikiController|deleteWiki"))
      .bodyPart(StringBodyPart("actions", "net-atos-entng-wiki-controllers-WikiController|updateWiki"))
      .bodyPart(StringBodyPart("actions", "net-atos-entng-wiki-controllers-WikiController|shareWiki"))
      .bodyPart(StringBodyPart("actions", "net-atos-entng-wiki-controllers-WikiController|deletePage"))
      .bodyPart(StringBodyPart("actions", "net-atos-entng-wiki-controllers-WikiController|shareWikiRemove"))
      .bodyPart(StringBodyPart("actions", "net-atos-entng-wiki-controllers-WikiController|shareWikiSubmit"))
      .check(status.is(200)))
    .exec(http("Logout - teacher")
      .get("""/auth/logout""")
      .check(status.is(302)))

    .exec(http("Login - student")
      .post("""/auth/login""")
      .formParam("""email""", """${studentLogin}""")
      .formParam("""password""", """blipblop""")
      .check(status.is(302)))

    .exec(http("List wikis")
      .get("/wiki/list")
      .check(status.is(200)))
    .exec(http("List pages")
      .get("/wiki/${wikiId}/listpages")
      .check(status.is(200)))
    .exec(http("Get page 3")
      .get("/wiki/${wikiId}/page/${pageId}")
      .check(status.is(200)))

    .exec(http("Create page")
      .post("/wiki/${wikiId}/page")
      .body(StringBody("""
            {"title" : "Ma page", 
            "content" : "Contenu"}
            """))
      .check(status.is(200), jsonPath("$._id").find.saveAs("studentPageId")))
    .exec(http("List pages after page creation")
      .get("/wiki/${wikiId}/listpages")
      .check(status.is(200)))
    .exec(http("Delete page 1")
      .delete("/wiki/${wikiId}/page/${studentPageId}")
      .check(status.is(200)))
    .exec(http("List pages after page deletion")
      .get("/wiki/${wikiId}/listpages")
      .check(status.is(200)))

    .exec(http("Update page")
      .put("/wiki/${wikiId}/page/${pageId}")
      .body(StringBody("""
            {"title" : "Ma première page v4",
            "content" : "Contenu de ma page mis à jour v4"}
            """))
      .check(status.is(200), jsonPath("$.number").is("1")))

    .exec(http("Update wiki")
      .put("/wiki/${wikiId}")
      .body(StringBody("""{"title" : "Mon 1er wiki v4"}"""))
      .check(status.is(200), jsonPath("$.number").is("1")))

    .exec(http("Delete wiki")
      .delete("/wiki/${wikiId}")
      .check(status.is(200), jsonPath("$.number").is("1")))

    .exec(http("Logout - student")
      .get("""/auth/logout""")
      .check(status.is(302)))

}
