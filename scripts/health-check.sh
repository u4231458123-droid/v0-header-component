#!/bin/bash
# Health Check Script für MyDispatch
# Prüft die Gesundheit der Anwendung nach Deployment
#
# Verwendung: ./scripts/health-check.sh [URL]
# Standard-URL: http://localhost:3000

set -e

# Farben
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Konfiguration
BASE_URL="${1:-http://localhost:3000}"
MAX_RETRIES=10
RETRY_DELAY=3
TIMEOUT=10

echo ""
echo "========================================"
echo -e "${BLUE}🏥 MyDispatch Health Check${NC}"
echo "========================================"
echo "URL: $BASE_URL"
echo "Max Retries: $MAX_RETRIES"
echo "Timeout: ${TIMEOUT}s"
echo ""

# Funktion: Endpoint prüfen
check_endpoint() {
    local endpoint=$1
    local expected_status=${2:-200}
    local url="${BASE_URL}${endpoint}"

    local response
    local http_code

    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout $TIMEOUT "$url" 2>/dev/null || echo "000")
    http_code=$response

    if [ "$http_code" == "$expected_status" ]; then
        echo -e "${GREEN}✅${NC} $endpoint (HTTP $http_code)"
        return 0
    else
        echo -e "${RED}❌${NC} $endpoint (HTTP $http_code, erwartet: $expected_status)"
        return 1
    fi
}

# Funktion: Mit Retry warten
wait_for_service() {
    local attempt=1

    echo -e "${YELLOW}⏳ Warte auf Service...${NC}"

    while [ $attempt -le $MAX_RETRIES ]; do
        if curl -s -o /dev/null --connect-timeout $TIMEOUT "$BASE_URL" 2>/dev/null; then
            echo -e "${GREEN}✅ Service erreichbar nach $attempt Versuchen${NC}"
            return 0
        fi

        echo "   Versuch $attempt/$MAX_RETRIES fehlgeschlagen, warte ${RETRY_DELAY}s..."
        sleep $RETRY_DELAY
        attempt=$((attempt + 1))
    done

    echo -e "${RED}❌ Service nicht erreichbar nach $MAX_RETRIES Versuchen${NC}"
    return 1
}

# Funktion: Response Time messen
measure_response_time() {
    local url="${BASE_URL}/"
    local time

    time=$(curl -s -o /dev/null -w "%{time_total}" --connect-timeout $TIMEOUT "$url" 2>/dev/null || echo "0")

    # Zeit in Millisekunden
    local ms
    ms=$(echo "$time * 1000" | bc 2>/dev/null || echo "N/A")

    if [ "$ms" != "N/A" ] && [ "$(echo "$ms < 3000" | bc)" -eq 1 ]; then
        echo -e "${GREEN}✅${NC} Response Time: ${ms}ms"
        return 0
    elif [ "$ms" != "N/A" ]; then
        echo -e "${YELLOW}⚠️${NC} Response Time: ${ms}ms (langsam)"
        return 0
    else
        echo -e "${YELLOW}⚠️${NC} Response Time: konnte nicht gemessen werden"
        return 0
    fi
}

# Hauptablauf
main() {
    local failed=0

    # 1. Warte auf Service
    echo -e "\n${BLUE}📡 Service-Verfügbarkeit${NC}"
    echo "----------------------------------------"
    if ! wait_for_service; then
        echo -e "\n${RED}❌ Health Check FEHLGESCHLAGEN: Service nicht erreichbar${NC}\n"
        exit 1
    fi

    # 2. Basis-Endpoints prüfen
    echo -e "\n${BLUE}🔗 Endpoint-Checks${NC}"
    echo "----------------------------------------"

    # Hauptseite
    check_endpoint "/" 200 || failed=$((failed + 1))

    # API Health Endpoint (falls vorhanden)
    check_endpoint "/api/health" 200 || true  # Optional

    # Favicon (zeigt statische Dateien funktionieren)
    check_endpoint "/favicon.ico" 200 || true  # Optional

    # 3. Performance
    echo -e "\n${BLUE}⚡ Performance${NC}"
    echo "----------------------------------------"
    measure_response_time

    # 4. Zusammenfassung
    echo -e "\n========================================"
    if [ $failed -eq 0 ]; then
        echo -e "${GREEN}✅ Health Check BESTANDEN${NC}"
        echo "========================================"
        exit 0
    else
        echo -e "${RED}❌ Health Check FEHLGESCHLAGEN${NC}"
        echo "   $failed Endpoint(s) nicht erreichbar"
        echo "========================================"
        exit 1
    fi
}

# Skript starten
main "$@"
