# Kubernetes — манифесты для Drivovo

## Структура файлов

```
deploy/k8s/
├── namespace.yml
├── backend/
│   ├── deployment.yml
│   ├── service.yml
│   └── hpa.yml
├── admin/
│   ├── deployment.yml
│   └── service.yml
├── web/
│   ├── deployment.yml
│   ├── service.yml
│   └── hpa.yml
├── ingress.yml
├── configmap.yml
└── secrets.yml        # шаблон, значения через CI/CD
```

Альтернатива: Helm chart — см. секцию Helm ниже.

## Namespace

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: drivovo
  labels:
    app.kubernetes.io/part-of: drivovo
```

## Backend — Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: drivovo
  labels:
    app: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
        - name: backend
          image: ghcr.io/<owner>/drivovo-backend:IMAGE_TAG
          ports:
            - containerPort: 5000
          envFrom:
            - configMapRef:
                name: drivovo-config
            - secretRef:
                name: drivovo-secrets
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 10
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /health
              port: 5000
            initialDelaySeconds: 5
            periodSeconds: 10
```

## Backend — Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: backend
  namespace: drivovo
spec:
  selector:
    app: backend
  ports:
    - port: 5000
      targetPort: 5000
  type: ClusterIP
```

## Admin — Deployment (Nginx)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: admin
  namespace: drivovo
  labels:
    app: admin
spec:
  replicas: 1
  selector:
    matchLabels:
      app: admin
  template:
    metadata:
      labels:
        app: admin
    spec:
      containers:
        - name: admin
          image: ghcr.io/<owner>/drivovo-admin:IMAGE_TAG
          ports:
            - containerPort: 80
          resources:
            requests:
              cpu: 50m
              memory: 64Mi
            limits:
              cpu: 200m
              memory: 128Mi
          livenessProbe:
            httpGet:
              path: /
              port: 80
            periodSeconds: 30
```

## Admin — Service

```yaml
apiVersion: v1
kind: Service
metadata:
  name: admin
  namespace: drivovo
spec:
  selector:
    app: admin
  ports:
    - port: 80
      targetPort: 80
  type: ClusterIP
```

## Web — Deployment (Next.js)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: drivovo
  labels:
    app: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: web
          image: ghcr.io/<owner>/drivovo-web:IMAGE_TAG
          ports:
            - containerPort: 3000
          envFrom:
            - configMapRef:
                name: drivovo-config
          resources:
            requests:
              cpu: 100m
              memory: 128Mi
            limits:
              cpu: 500m
              memory: 512Mi
          livenessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 30
          readinessProbe:
            httpGet:
              path: /
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
```

## Ingress (nginx-ingress)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: drivovo-ingress
  namespace: drivovo
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - drivovo.com
        - admin.drivovo.com
        - api.drivovo.com
      secretName: drivovo-tls
  rules:
    - host: drivovo.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: web
                port:
                  number: 3000

    - host: admin.drivovo.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: admin
                port:
                  number: 80

    - host: api.drivovo.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: backend
                port:
                  number: 5000
```

## ConfigMap

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: drivovo-config
  namespace: drivovo
data:
  NODE_ENV: production
  HTTP_PORT: "5000"
```

## Secret (шаблон)

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: drivovo-secrets
  namespace: drivovo
type: Opaque
stringData:
  DATABASE_URL: "postgresql://user:pass@host:5432/drivovo"
  # Заполнять через CI/CD или sealed-secrets
```

## HPA (Horizontal Pod Autoscaler)

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: backend-hpa
  namespace: drivovo
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: backend
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```

## Helm Chart (альтернатива)

Структура:
```
deploy/helm/drivovo/
├── Chart.yaml
├── values.yaml
├── values-staging.yaml
├── values-production.yaml
└── templates/
    ├── _helpers.tpl
    ├── namespace.yaml
    ├── backend-deployment.yaml
    ├── backend-service.yaml
    ├── admin-deployment.yaml
    ├── admin-service.yaml
    ├── web-deployment.yaml
    ├── web-service.yaml
    ├── ingress.yaml
    ├── configmap.yaml
    ├── secrets.yaml
    └── hpa.yaml
```

### values.yaml (defaults)

```yaml
global:
  imageTag: latest
  registry: ghcr.io/<owner>

backend:
  replicas: 2
  image: drivovo-backend
  port: 5000
  resources:
    requests: { cpu: 100m, memory: 128Mi }
    limits: { cpu: 500m, memory: 512Mi }

admin:
  replicas: 1
  image: drivovo-admin
  port: 80
  resources:
    requests: { cpu: 50m, memory: 64Mi }
    limits: { cpu: 200m, memory: 128Mi }

web:
  replicas: 2
  image: drivovo-web
  port: 3000
  resources:
    requests: { cpu: 100m, memory: 128Mi }
    limits: { cpu: 500m, memory: 512Mi }

ingress:
  enabled: true
  hosts:
    web: drivovo.com
    admin: admin.drivovo.com
    api: api.drivovo.com
  tls:
    enabled: true
    issuer: letsencrypt-prod
```

### Деплой Helm

```bash
# Staging
helm upgrade --install drivovo deploy/helm/drivovo \
  -f deploy/helm/drivovo/values-staging.yaml \
  --set global.imageTag=$IMAGE_TAG \
  -n drivovo --create-namespace

# Production
helm upgrade --install drivovo deploy/helm/drivovo \
  -f deploy/helm/drivovo/values-production.yaml \
  --set global.imageTag=$IMAGE_TAG \
  -n drivovo
```

## Полезные команды

```bash
# Статус
kubectl get all -n drivovo

# Логи
kubectl logs -f deployment/backend -n drivovo

# Рестарт деплоймента
kubectl rollout restart deployment/backend -n drivovo

# Откат
kubectl rollout undo deployment/backend -n drivovo

# Применить манифесты
kubectl apply -f deploy/k8s/ -n drivovo
```
