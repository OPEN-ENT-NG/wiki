begin transaction
match (a:Action) SET a.name = replace(a.name, 'fr.wseduc.wiki', 'net.atos.entng.wiki');
commit