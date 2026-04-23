#! /usr/bin/env bash
set -e

mv concepts/translations concepts/framework/translations || echo "Concepts > Translations already migrated"

mkdir products/tools || echo "Product > Tools already created"
mv products/cli products/tools/cli || echo "Products > CLI already migrated"

mkdir products/frontends || echo "Products > Frontends already created"
mv products/digital-sales-rooms products/frontends/digital-sales-rooms || echo "DSR already migrated"
mv products/sales-agent products/frontends/sales-agent || echo "Sales agent already migrated"

mkdir products/projects || echo "Products > Projects already created"
mv products/Nexus products/projects/nexus || echo "Nexus already migrated"

mkdir products/environments || echo "Products > Environments already created"
mv products/paas products/environments/paas || echo "PaaS already migrated"
mv products/saas.md products/environments/saas.md || echo "SaaS already migrated"


touch products/tools/mcp.md
touch products/projects/shopware-payments.md
touch products/environments/local.md
touch products/environments/ci.md