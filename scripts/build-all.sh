#!/usr/bin/env bash
set -euo pipefail

SERVICES=("api-gateway" "user-service" "product-service" "notification-service")

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

for S in "${SERVICES[@]}"; do
    echo "🔧 Normalizando dependencias en $S..."
    pushd "microservices/$S" >/dev/null
    
    # ===== Core Nest 11 =====
    npm pkg set "dependencies.@nestjs/common=^11" \
    "dependencies.@nestjs/core=^11" \
    "dependencies.@nestjs/platform-express=^11" \
    "dependencies.reflect-metadata=^0.2.2" \
    "dependencies.rxjs=^7.8.1"
    
    # ===== Axios/JWT/Passport (si aplican en ese servicio, no pasa nada si ya estaban) =====
    npm pkg set "dependencies.@nestjs/axios=^4" \
    "dependencies.@nestjs/jwt=^11" \
    "dependencies.@nestjs/passport=^11" \
    "dependencies.passport=^0.7.0" \
    "dependencies.passport-jwt=^4.0.1"
    
    # ===== TypeORM stack (user-service) =====
    npm pkg set "dependencies.@nestjs/typeorm=^11" \
    "dependencies.typeorm=^0.3.20" \
    "dependencies.pg=^8.12.0" || true
    
    # ===== Mongoose stack (product-service) =====
    npm pkg set "dependencies.@nestjs/mongoose=^11" \
    "dependencies.mongoose=^8.6.0" || true
    
    # ===== Validación/DTOs (si usas class-validator/transformer) =====
    npm pkg set "dependencies.class-validator=^0.14.1" \
    "dependencies.class-transformer=^0.5.1"
    
    # ===== Cosas comunes de auth =====
    npm pkg set "dependencies.bcryptjs=^2.4.3"
    
    # ===== Dev deps de TS =====
    npm pkg set "devDependencies.typescript=^5.5.4" \
    "devDependencies.ts-node=^10.9.2" \
    "devDependencies.tsconfig-paths=^4.2.0" \
    "devDependencies.@types/node=^20" \
    "devDependencies.@types/express=^4.17.21" \
    "devDependencies.@types/passport-jwt=^4.0.1" \
    "devDependencies.@types/bcryptjs=^2.4.6"
    
    
    if [ ! -f tsconfig.json ]; then
    cat > tsconfig.json <<'JSON'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "types": ["node"],
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "outDir": "./dist",
    "skipLibCheck": true
  },
  "include": ["src/**/*.ts"]
}
JSON
    else
        # Parchea campos clave si ya tienes tsconfig.json
        npx json -I -f tsconfig.json -e '
      this.compilerOptions=this.compilerOptions||{};
      this.compilerOptions.target="ES2020";
      this.compilerOptions.module="CommonJS";
      this.compilerOptions.lib=["ES2020"];
      this.compilerOptions.moduleResolution="node";
      this.compilerOptions.types=["node"];
      this.compilerOptions.emitDecoratorMetadata=true;
      this.compilerOptions.experimentalDecorators=true;
      this.compilerOptions.esModuleInterop=true;
      this.compilerOptions.sourceMap=true;
      this.compilerOptions.outDir="./dist";
      this.compilerOptions.skipLibCheck=true;
        ' || true
    fi
    
    
    rm -rf node_modules package-lock.json
    if [ -f package-lock.json ]; then rm -f package-lock.json; fi
    
    # Si quieres instalación reproducible:
    npm i
    
    popd >/dev/null
done

echo "✅ Dependencias normalizadas en todos los servicios."
