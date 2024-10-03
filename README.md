# Automatisation de la production

**RYSAK** Hugo --> hugo.rysak4@etu.univ-lorraine.fr  
**TROHA** Stanislas --> stanislas.troha8@etu.univ-lorraine.fr

_ _ _ 
## TD 1
Grâce au TD1, nous avons déjà pu comprendre le fonctionnement de php ainsi que de ses extensions (sqlite3, mbstring, gd). Nous avons également découvert phpunit qui permet de faire des tests unitaire contenus dans divers fichiers dans un dossier (tst).
Nouvelle commande utile découverte : `php -m` pour lister les extensions php en cours de fonctionnement.

L'utilisation de make peut rendre pratique l'installation de beaucoup de repository github, ce qui nous a donné l'idée d'intégrer un makefile à l'avenir. En définissant des champs du nom qu'on veut dans un makefile : 
```
install:
	bin/composer install

start:
	php -S localhost:8080

test:
	# cd tst && ../vendor/bin/phpunit
	./vendor/bin/phpunit tst
```
On peut simplement faire `make install`pour installer les dépendances de PrivateBin avec composer, `make start` pour lancer le serveur php, puis `make test` pour lancer les tests avec phpunit dans le dossier *tst*.

_ _ _ 

## TD 2
Nous avons découvert les actions avec les workflows github. 

Lors de chaque action faite par un utilisateur du repository github, on peut exécuter une ou plusieurs tâches (jobs) en lien avec cette dernière. Dans notre cas, on effectue des tests sur l'application grâce à **phpunit** après chaque requête *push*, ou *pull_request*.

On peut précisément définir l'action du workflow grâce à un fichier .yml qui doit être stocké dans le chemin ***.github/workflows/*** depuis la racine du repository.

Voici le notre, ***[ci.yml](.github/workflows/ci.yml)*** :
```yml
name: CI Tests # Ici on définit le nom du workflow

# Dans on, on peut choisir pour quelle type d'évènement les tâches définies dans la section jobs ci-dessous vont être déclenchées
on:
  push: # Lorsqu'un collaborateur du github fait un push sur la branche main. On peut ajouter autant de branches qu'on veut sur lesquelles les évènements doivent déclencher l'exécutuion des tâches.
    branches:
      - main
  pull_request: # Idem mais pour une pull_request sur la branche main.
    branches:
      - main

jobs: # On définit dans cette section les tâches à exécuter lorsque les évènements ci-dessus ont été déclenchés.
  test: # le nom de notre tâche à exécuter

    runs-on: ubuntu-latest  # On choisit d'utiliser un environnement Ubuntu car cela a fonctionné sur notre machine sous Ubuntu 22.04.4 LTS


    steps: # Puis les étapes différentes à faire pour exécuter correctement notre tâche, consistant en des tests
    - name: Checkout code
      uses: actions/checkout@v4  # On récupère le code source du repository grâce à une action github qui est prédéfinie

    - name: PHP Set up
      uses: shivammathur/setup-php@v2  # On utilise encore une action prédéfinie pour configurer php
      with: # Permet de passer des paramètres à l'action setup-php
        php-version: '8.1'  # Version de PHP qu'on utilise
        extensions: mbstring, sqlite3, gd, simplexml  # Extensions PHP nécessaires

    - name: Dependences
      run: | # permet d'exécuter une commande shell sur l'environnement ubuntu déployé.
        composer install  # Installe les dépendances via Composer

    - name: tests avec PHPUnit
      run: |
        vendor/bin/phpunit --configuration phpunit.xml  # Exécute les tests unitaires avec PHPUnit
```

Voici des captures d'écrans montrant la réalisation des tests : 
![Screen de l'installaiton de dépendances](ressources/screen.png)

![Screen de l'affichage de fin une fois les tests effectués](ressources/screen_2.png)




_ _ _ 

## TD 3 : Code Coverage

Nous avons découvert que pour les tests ou du code coverage, on peut spécifier via l'option `--configuration` le fichier de configuration [phpunit.xml](phpunit.xml). Grâce à ça, la partie concernée du fichier (`<coverage></coverage>` ou `<testsuite></testsuite>`) va être utilisée par phpunit pour run les tests ou le coverage du code.
D'ailleurs, la configuration de [phpunit.xml](phpunit.xml) importe. C'est dans ce fichier qu'on peut choisir les dossiers/fichiers qui sont testés pour le coverage et les tests. On peut définir les dossiers à tester avec la balise `<include>` : 
```xml
<include>
      <directory suffix=".php">./lib</directory>
</include>
```
A contrario, on peut choisir les fichiers/dossiers à exclure de la vérification qui sont contenus dans un dossier qui est testé grâce à la balise `<exclude>` : 
```xml
<exclude>
      <file>./lib/Data/AbstractData.php</file>
</exclude>
```

*Pour ce TD, la configuration du fichier [phpunit.xml](phpunit.xml) restera la même que ce soit pour le code coverage en local, ou avec github actions*.

#### En local sur la machine

1) Tout d'abord, il est nécessaire d'installer l'extension php **xdebug**. On le fait via `sudo apt install php-xdebug`. On peut vérifier qu'elle est bien en cours avec `php -m | grep xdebug`
2) Une fois qu'elle est bien installée, on vérifie que le fichier **[phpunit.xml](phpunit.xml)** est configuré de sorte à pouvoir générer un rapport de couverture. 
![alt text](ressources/phpunit.png)
Dans notre cas, le rapport **HTML** sera généré dans `coverage/php-coverage-report`. Le rapport **COBERTURA** dans `coverage` sous le nom de `coverage-cobertura.xml`.
3) Ensuite, pour exécuter le code coverage sur notre machine, il suffit d'abord d'installer les dépendances via le [makefile](makefile) avec `make install`. Ensuite, lancer le serveur php avec `make start`. 
Puis faire la commande : ```XDEBUG_MODE=coverage vendor/bin/phpunit --configuration phpunit.xml```. La commmande signifie : 
    - ***XDEBUG_MODE=coverage*** : On spécifie à l'extension xdebug de passer en mode coverage de code. Sinon on obtient un warning. On peut alternativement modifier le fichier php.ini sur sa machine mais ce n'est pas aussi pratique.
![coverage results](ressources/coverage.png)

4) Puis, les résultats sous forme html sont disponibles dans `coverage/php-coverage-report/index.html` (qui n'est pas push sur le repository car ignoré). Les résultats sont disponibles dans ce répertoire suite à la configuration que l'on a faite à l'étape 2 dans [phpunit.xml](phpunit.xml) pour la balise `<html>` :
![Resultats](ressources/resultats.png)
  

#### Sur github action

Pour github action, nous avons également utilisé le fichier [phpunit.xml](phpunit.xml). Voici le fichier de configuration [ci.yml](.github/workflows/ci.yml) (celui du TD précédent, modifié) qui permet de créer les rapports, puis de les afficher sur le summary github : 
```yaml
name: CI Tests  # Ici on définit le nom du workflow

# Dans on, on peut choisir pour quelle type d'évènement les tâches définies dans la section jobs ci-dessous vont être déclenchées
on:
  push: # Lorsqu'un collaborateur du github fait un push sur la branche main. On peut ajouter autant de branches qu'on veut sur lesquelles les évènements doivent déclencher l'exécutuion des tâches.
    branches:
      - main
  pull_request: # Idem mais pour une pull_request sur la branche main.
    branches:
      - main

jobs: # On définit dans cette section les tâches à exécuter lorsque les évènements ci-dessus ont été déclenchés.
  test: # le nom de notre tâche à exécuter
    runs-on: ubuntu-latest # On choisit d'utiliser un environnement Ubuntu car cela a fonctionné sur notre machine sous Ubuntu 22.04.4 LTS

    steps: # Puis les étapes différentes à faire pour exécuter correctement notre tâche, consistant en des tests
    - name: Checkout code
      uses: actions/checkout@v4 # On récupère le code source du repository grâce à une action github qui est prédéfinie

    - name: PHP Set up
      uses: shivammathur/setup-php@v2  # On utilise encore une action prédéfinie pour configurer php
      with: # Permet de passer des paramètres à l'action setup-php
        php-version: '8.1' # Version de PHP qu'on utilise
        extensions: mbstring, sqlite3, gd, simplexml, xdebug # Extensions PHP nécessaires

    - name: Dependences
      run: |  # permet d'exécuter une commande shell sur l'environnement ubuntu déployé.
        composer install  # Installe les dépendances via Composer

    - name: tests avec PHPUnit
      run: | # on lance les tests via phpunit et la configuration <testsuite> de phpunit.xml
        vendor/bin/phpunit --configuration phpunit.xml

    - name: coverage avec Xdebug
      run: | # on crée le dossier qui contiendra les rapports de coverage puis on lance phpunit en mode coverage avec XDEBUG
        mkdir -p coverage
        XDEBUG_MODE=coverage vendor/bin/phpunit --configuration phpunit.xml

    - name: ajout du rapport de couverture 
      uses: irongut/CodeCoverageSummary@v1.3.0 # action github qu'on utilise 
      with:
        filename: coverage/coverage-cobertura.xml
        badge: true
        format : markdown
        output : both

    - name : ajout du rapport au summary github
      run : |
        echo "## Résumé de la couverture de code" >> $GITHUB_STEP_SUMMARY
        cat code-coverage-results.md >> $GITHUB_STEP_SUMMARY

```



_ _ _ 

## TD 4 : Analyse statique

### - PHPCS (PHP Code Sniffer)

##### En local sur la machine

Tout d'abord, avant de pouvoir utiliser phpcs, on doit l'installer sur le projet à l'aide de composer : 
```bash
sudo apt install php-xmlwriter
composer require --dev "squizlabs/php_codesniffer=3.*"
```
On peut voir qu'avant d'ajouter phpcs au projet, il faut installer sur la machine l'extension php **xmlwriter** qui est une extension utilisée par phpcs.

Nous avons choisi de configurer phpcs à l'aide d'un fichier et non en ligne de commandes.
Pour ce faire, on doit créer un fichier du nom `.phpcs.xml`, `phpcs.xml`, `.phpcs.xml.dist`, ou `phpcs.xml.dist`. 
Nous avons choisi de l'appeler `phpcs.xml` et de le placer à la racine du projet.

[phpcs.xml](phpcs.xml) (commenté) : 
```xml
<?xml version="1.0"?>
<ruleset name="phpCS pour PrivateBin">
  <file>lib</file> <!-- Le dossier sur lequel on veut utiliser phpcs-->

  <!-- Ici on met les standards que l'on veut respecter -->
  <rule ref="PSR1"/>
  <rule ref="PSR2"/>
  <rule ref="PSR12"/>

    <!-- On spécifie l'extension des fichiers qu'on veut analyser-->
  <extensions>
    <extension name="php"/>
  </extensions>

  <!-- Coloration des rapports -->
  <arg name="colors"/>

  <!-- Pour avoir un rapport complet-->
  <arg name="report" value="full"/>

</ruleset>
```
Ensuite, il suffit de lancer **phpcs**`./vendor/bin/phpcs` depuis la racine du projet.
On obient :
![phpcs_result](ressources/phpcs_exec.png)
On voit donc chaque erreur et warning par fichier php situé dans [lib/](lib/). 


### - PHPMD (PHP Mess Detector)
##### En local sur la machine
Avant de pouvoir utiliser PHPMD, on doit l'ajouter au projet.
```bash
composer require --dev "phpmd/phpmd=@stable"
```

Identiquement à [phpcs](#--phpcs-php-code-sniffer), nous avons choisi de directement faire la configuration via un fichier plutôt que dans la ligne de commande. Il nous sera utile pour déployer **phpcs** sur les actions github.
Le fichier en question doit être nommé [ruleset.xml](ruleset.xml) :
```xml
<?xml version="1.0"?>
<?xml version="1.0"?>
<ruleset name="My first PHPMD rule set"
         xmlns="http://pmd.sf.net/ruleset/1.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://pmd.sf.net/ruleset/1.0.0
                     http://pmd.sf.net/ruleset_xml_schema.xsd"
         xsi:noNamespaceSchemaLocation="
                     http://pmd.sf.net/ruleset_xml_schema.xsd">
    <description>
        My custom rule set that checks my code...
    </description>
     <!-- Import the entire unused code rule set -->
    <rule ref="rulesets/unusedcode.xml" />

    <!-- Import the entire cyclomatic complexity rule -->
    <rule ref="rulesets/codesize.xml/CyclomaticComplexity" />
    
    <!-- Pareil pour règles de tailles -->
    <rule ref="rulesets/codesize.xml" />

    <!-- Et pour règles de nommage -->
    <rule ref="rulesets/naming.xml" />

    <!-- EvalExpression Rule qui est incluse dans controversial -->
    <rule ref="rulesets/controversial.xml" />
</ruleset>

```
Les règles importées sont celles données par l'exemple sur la doc de phpmd ainsi que celles présentes dans le cours.

Puis, pour lancer la détection : 
```bash
./vendor/bin/phpmd ./lib ansi ruleset.xml
```
![screen_exec_phpmd](ressources/exec_phpmd.png)
On obtient bien les règles qui sont violées pour chaque fichier php situé dans [.lib](lib/) (ex : conventions de nommage, complexité cyclomatique etc.).

### - PHPStan (PHP Static Analysis Tool )
##### En local sur la machine
Comme pour les deux outils précédents, on doit inclure **PHPStan** dans le projet à l'aide de composer : 
```bash
composer require --dev phpstan/phpstan
```
Nous avons encore décidé de créer un fichier [phpstan.neon](phpstan.neon) pour la configuration plutôt que de la faire en ligne de commmande. 
[phpstan.neon](phpstan.neon) : 
```neon
parameters:
  level: 5 # niveau d'analyse (de 0 a 9, 9 étant très strict)
  paths: # on inclue les dossiers à tester dont le code est écrit à la main (inutile de vérifier le vendor)
    - lib
    - tst
```

Il suffit maintenant de lancer la détection avec : 
```bash
./vendor/bin/phpstan analyse -c phpstan.neon
```

Voici divers exemples selon le niveau d'exigence spécifié dans [phpstan.neon](phpstan.neon) : 

##### Niveau 0 (le moins strict)
![exec_lvl0](ressources/phpstan_lvl0.png)
![res_lvl0](ressources/phpstan_res_lvl0.png)
##### Niveau 5 (intermédiaire)
![exec_lvl5](ressources/phpstan_lvl5.png)
![res_lvl5](ressources/phpstan_res_lvl5.png)
##### Niveau 9 (niveau maximal)
![exec_lvl9](ressources/phpstan_lvl9.png)
![res_lvl9](ressources/phpstan_res_lvl9.png)

On peut constater une grosse différence du nombre d'erreurs trouvées selon le niveau d'exigence spécifié dans le fichier de configuration.




### Actions Github pour ces outils
Pour ces actions, il suffit de modifier le fichier [ci.yml](.github/workflows/ci.yml) en ajoutant trois nouvelles étapes (**steps**), correspondant respectivement aux trois outils (**phpcs, phpmd, phpstan**). Les étapes ont été insérées dans le même **job** utilisé jusqu'à présent.
```yml
    - name: PHP CodeSniffer
      run: |
        ./vendor/bin/phpcs --report=source > phpcs_report.txt || true
        echo "## PHP CodeSniffer Report" >> $GITHUB_STEP_SUMMARY
        echo '```' >> $GITHUB_STEP_SUMMARY
        cat phpcs_report.txt >> $GITHUB_STEP_SUMMARY
        echo '```' >> $GITHUB_STEP_SUMMARY


    - name: PHP Mess Detector
      run: |
        ./vendor/bin/phpmd ./lib github ansi ruleset.xml > phpmd_report.txt || true


    - name: PHPStan
      run: |
        ./vendor/bin/phpstan analyse -c phpstan.neon --error-format=github > phpstan_report.txt || true
```
Pour l'instant nous n'avons réussi qu'à ajouter la sortie de **PHPCS** au summary github car les formats de **phpstan** et **phpmd** ne conviennent pas et sont trop longs.
![phpcs_summary_github](ressources/phpcs_summary_github.png)

### Correction des erreurs détectées par outil

##### PHPCS
Les 5 erreurs corrigées proviennent du même fichier  :
<u>FILE</u>: *[lib/Data/S3Storage.php](lib/Data/S3Storage.php)*
```bash
FOUND 5 ERRORS AND 5 WARNINGS AFFECTING 10 LINES
--------------------------------------------------------------------------------------------------------------------
   1 | ERROR   | [x] Header blocks must be separated by a single blank line
  50 | WARNING | [ ] Property name "$_client" should not be prefixed with an underscore to indicate visibility
  58 | WARNING | [ ] Property name "$_options" should not be prefixed with an underscore to indicate visibility
  66 | WARNING | [ ] Property name "$_bucket" should not be prefixed with an underscore to indicate visibility
  74 | WARNING | [ ] Property name "$_prefix" should not be prefixed with an underscore to indicate visibility
 103 | WARNING | [ ] Line exceeds 120 characters; contains 130 characters
 122 | ERROR   | [ ] Method name "_listAllObjects" must not be prefixed with an underscore to indicate visibility
 149 | ERROR   | [ ] Method name "_getKey" must not be prefixed with an underscore to indicate visibility
 167 | ERROR   | [ ] Method name "_upload" must not be prefixed with an underscore to indicate visibility
 418 | ERROR   | [ ] Method name "_getExpiredPastes" must not be prefixed with an underscore to indicate visibility
--------------------------------------------------------------------------------------------------------------------
```
Une fois les erreurs et warnings corrigés, [lib/Data/S3Storage.php](lib/Data/S3Storage.php) n'apparaît plus dans la sortie de **phpcs** :
![S3Storage.php](ressources/S3Storage.png)



##### PHPMD
4 violations proviennent du même fichier :
<u>FILE</u>: [lib/Model/Comment.php](lib/Model/Comment.php)
```bash
----------------------------------------------------------------------------------------------------------
 26  | VIOLATION | The property $_paste is not named in camelCase.
 132 | VIOLATION | Avoid variables with short names like $id. Configured minimum length is 3.
 161 | VIOLATION | The method _sanitize is not named in camelCase.
 182 | VIOLATION | Avoid variables with short names like $vh. Configured minimum length is 3.
```

L'autre violation provient de :
<u>FILE</u>: [lib/Filter.php](lib/Filter.php)
```bash
---------------------------------------------------------------------------------------------------
 67  | VIOLATION | Avoid variables with short names like $i. Configured minimum length is 3.
```

Une fois ces modifications faites, on constate qu'il n'y a plus aucune violation, ni dans [lib/Model/Comment.php](lib/Model/Comment.php) ni dans [lib/Filter.php](lib/Filter.php) puisque les classes n'apparaissent plus dans la sortie de **phpmd** :
![phpmd_violations](ressources/phpmd_violations.png)






##### PHPSTAN
1.
``` bash
 ------ ------------------------------------------------------------------------------------------ 
  Line   lib/Model.php                                                                             
 ------ ------------------------------------------------------------------------------------------ 
  44     Class PrivateBin\Configuration referenced with incorrect case: PrivateBin\configuration.  
 ------ ------------------------------------------------------------------------------------------
```

2.
```bash
 ------ -------------------------------------------------------------------------------------------------- 
  Line   lib/Data/Database.php                                                                             
 ------ -------------------------------------------------------------------------------------------------- 
  60     PHPDoc tag @return has invalid value (): Unexpected token "\n     ", expected type at offset 150  
 ------ --------------------------------------------------------------------------------------------------
```


3.
```bash
 ------ -------------------------------------------------------------------------------------------------- 
  Line   lib/Data/Filesystem.php                                                                           
 ------ -------------------------------------------------------------------------------------------------- 
  70     PHPDoc tag @return has invalid value (): Unexpected token "\n     ", expected type at offset 127  
 ------ --------------------------------------------------------------------------------------------------
```

4. 
```bash
 ------ -------------------------------------------------------------------------------------------------- 
  Line   lib/Data/GoogleCloudStorage.php                                                                   
 ------ -------------------------------------------------------------------------------------------------- 
  52     PHPDoc tag @return has invalid value (): Unexpected token "\n     ", expected type at offset 138  
 ------ --------------------------------------------------------------------------------------------------
```

5.
```bash
 ------ --------------------------------------------------------------------------------------------------------- 
  Line   lib/Filter.php                                                                                           
 ------ --------------------------------------------------------------------------------------------------------- 
  50     Parameter #1 $messageId of static method PrivateBin\I18n::_() expects string, array<int, string> given.  
 ------ --------------------------------------------------------------------------------------------------------- 
```

Une fois ces 5 erreurs résolues, on peut voir que les noms des classes concernées n'apparaîssent plus dans la sortie de **phpstan**, ce qui veut dire qu'elles sont bien corrigées : 
![phpstan_erreurs](ressources/phpstan_erreurs.png)

#### Bonus : Résolution du package aws entraînant une exposition à un attaque de sécurité.
Après un `composer audit` on obtient :  
```bash
Found 1 security vulnerability advisory affecting 1 package:
+-------------------+----------------------------------------------------------------------------------+
| Package           | aws/aws-sdk-php                                                                  |
| Severity          | medium                                                                           |
| CVE               | CVE-2023-51651                                                                   |
| Title             | Potential URI resolution path traversal in the AWS SDK for PHP                   |
| URL               | https://nvd.nist.gov/vuln/detail/CVE-2023-51651                                  |
| Affected versions | >=3.0.0,<3.288.1                                                                 |
| Reported at       | 2023-11-22T00:00:00+00:00                                                        |
+-------------------+----------------------------------------------------------------------------------+
Found 1 abandoned package:
+-------------------+----------------------------------------------------------------------------------+
| Abandoned Package | Suggested Replacement                                                            |
+-------------------+----------------------------------------------------------------------------------+
| yzalis/identicon  | none                                                                             |
+-------------------+----------------------------------------------------------------------------------+
```
On peut voir que la CVE concerne les versions comprises entre la **3.0.0** et la **3.288.1**. Or, pour ce projet, la version **3.254.0** est utilisée, elle est donc concernée. Cela rend l'application vulnérable.
Pour résoudre ce problème, il suffit de passer à une version qui n'est pas concernée par cette CVE :
```bash
composer require aws/aws-sdk-php:^3.288.1
```
Maintenant, avec un `composer audit`, aucun problème de sécurité n'est détecté (et tous les outils utilisés jusqu'à présent donnent les mêmes résultats): 
```bash
No security vulnerability advisories found.
Found 1 abandoned package:
+-------------------+----------------------------------------------------------------------------------+
| Abandoned Package | Suggested Replacement                                                            |
+-------------------+----------------------------------------------------------------------------------+
| yzalis/identicon  | none                                                                             |
+-------------------+----------------------------------------------------------------------------------+
```
Seul un package est détecté comme obsolète (il n'est plus supporté), mais s'il est dans le projet c'est qu'il doit être utile donc nous ne nous en occuperons pas.