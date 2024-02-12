# DevOps akademija - Web development - Izposojevalnica

**Demo aplikacija** tečaja **Web development** v okviru **DevOps akademije** by Jurij Cvikl.

Genovefa ima doma kar precej veliko in zanimivo zbirko knjig. Kljub pojavu raznoraznih elektronskih bralnikov pa meni, da je ima papir še vedno svoj čar, pa pod mizo lažje podložiš knjigo kot pa Kindle. Genovefino zbirko knjig cenijo tudi njeni prijatelji, saj na ta način pridejo do prodajnih uspešnic prej kot v knjižnici. Žal pa si Genovefa bistveno bolje zapomni vsebino knjig kot pa osebo, ki si je neko knjigo izposodila.

Pomagajte ji iz zagate s spletno aplikacijo, ki bo še najbolj spominjala na knjižnico. Aplikacija naj omogoča vnos nove knjige (vsaka knjiga naj pri vnosu dobi svojo unikatno številko), lahko celo omogočite izpis nalepke oz. kartončka za posamezno knjigo.

Poleg tega naj aplikacija omogoča tudi beleženje evidence o izposoji (torej, kdo si je izposodil katero knjigo in kdaj). Zgodovina izposoj za posamezno knjigo naj se ohranja.

Genovefinim prijateljem pa omogočite iskanje po njeni zbirki knjig in pregled statusov (ali je posamezna knjiga izposojena ali ne).

Aplikacija naj ponuja tudi izpis različnih statistik (kdo si največkrat izposodi knjigo, kdo ima trenutno največ izposojenih knjig, …).

Aplikacija naj bo napisana tako, da bo omogočala tudi izposojo drugih reči (npr. CD-jev, orodja, …)


# Aplikacija omogoča:
- registracijo in prijavo uporabnikov
- prijavljeni uporabniki lahko:
  - dodajajo svoje tipe predmetov, ki jih želijo posojati
  - dodajajo svoje predmete za posojo
  - posojajo in vračajo svoje predmete
  - si ogledajo njihovo trenutno izposojo
  - gledajo poročila o svoji izposoji
  - prebirajo katalog, iščejo po njem in si izposojajo predmete
- neprijavljenih uporabniki lahko:
  - prebirajo katalog, iščejo po njem in si izposojajo predmete

# How to use app
1. run `cp .env.example .env` to create config file
2. run `docker-compose up`
3. open `http://localhost:3000` in browser
4. in order to fill test data, run `npm run import:db-docker`

# Test user data
- Email: jurij@marcelino.si, Password: jure20
- Email: some@user.com, Password: some20

# Deployment to Kubernetes (DigitalOcean)

Production: https://my-app.77777771.xyz/

We are deploying a Kubernetes cluster with two nodes for the database and application.
Configuring the cluster to use Ingress, Cert Manager and Letsencrypt Issuers

### Kubernetes cluster setup

1. Deploy a DigitalOcean Kubernetes cluster with 2x `2 GB RAM / 1 vCPU / 50 GB storage`
2. Configure `kubectl` to use the deployed Kubernetes config at every command, e.g.`kubectl --kubeconfig=/home/user/k8s-1-29-1-do-0-fra1-xxxxx-kubeconfig.yaml get nodes`
3. Command can be used as an alias `alias alias kc="kubectl --kubeconfig=/home/user/k8s-1-29-1-do-0-fra1-xxxxx-kubeconfig.yaml"`
4. Install Ingress: `kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.9.6/deploy/static/provider/do/deploy.yaml`
5. Install Cert Manager: `kubectl apply -f https://github.com/jetstack/cert-manager/releases/download/v1.14.1/cert-manager.yaml`
6. Apply Letsencrypt `staging` and `prod` cluster issuers: `kubectl apply -f deploy/letsencrypt.yaml`

> **_NOTE:_**
> To use Cert Manager with HTTP01 resolver on DigitalOcean configure the following:
> 1. Get the Load Balancer IP address `kubectl get svc --namespace=ingress-nginx` - Wait a few minutes if it's still in pending state for `External-IP`
> 2. Create DNS entry ("A" type) for Load Balancer (e.g. kube.mydomain.tld)
> 3. Edit the Cert Manager to use that DNS entry `kubectl edit service ingress-nginx-controller -n ingress-nginx`
> 4. Append the following line under the metadata annotations `service.beta.kubernetes.io/do-loadbalancer-hostname: kube.mydomain.tld`

### Database deployment

1. Apply the Kubernetes YAML files `kubectl apply -f deploy/mongodb.yaml`
2. Check status in namespace `default` with `kubectl rollout status deployment/mongo -n default`

### Application deployment

1. Apply the Kubernetes YAML files `kubectl apply -f deploy/app.yaml`
2. View rollout status `kubectl rollout status statefulset/my-app -n default`

> **_OPTIONAL - one time database seeding from files:_**
> 1. Go to this projects root directory
> 2. Find the MongoDB pod name with `kubectl -n get pods` it should look like `mongo-8f8d96fbd-l5lbr` and use it in the other commands
> 3. Copy the `data` folder files to the pod `kubectl cp -n default data/. mongo-8f8d96fbd-l5lbr:/home`
> 
> Seed each of the files:
> 1. Users: `kubectl exec -it mongo-8f8d96fbd-l5lbr -- mongoimport --db test --collection Users --authenticationDatabase admin --username adminuser --password password123 --drop --mode upsert --upsertFields id --jsonArray --file /home/Users.json`
> 2. Types: `kubectl exec -it mongo-8f8d96fbd-l5lbr -- mongoimport --db test --collection Types --authenticationDatabase admin --username adminuser --password password123 --drop --mode upsert --upsertFields id --jsonArray --file /home/Types.json`
> 3. Items: `kubectl exec -it mongo-8f8d96fbd-l5lbr -- mongoimport --db test --collection Items --authenticationDatabase admin --username adminuser --password password123 --drop --mode upsert --upsertFields id --jsonArray --file /home/Items.json`

##### New image rollout

1. Change the `image` property in [`deploy/app.yaml`](deploy/app.yaml)
2. Apply the Kubernetes YAML files `kubectl apply -f deploy/app.yaml`
3. View rollout status `kubectl rollout status statefulset/my-app -n default`

![Rollout](https://i.imgur.com/NBHL1yy.gif)
