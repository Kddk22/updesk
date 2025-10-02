#!/bin/bash

# UpDesk Webserver Comparison Script
# Vergleicht nginx und Apache Performance

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REQUESTS=1000
CONCURRENCY=50
URL="http://localhost/"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         UpDesk Webserver Performance Comparison          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check if ab (Apache Bench) is installed
if ! command -v ab &> /dev/null; then
    echo -e "${RED}❌ Apache Bench (ab) ist nicht installiert!${NC}"
    echo ""
    echo "Installation:"
    echo "  Ubuntu/Debian: sudo apt install apache2-utils"
    echo "  macOS: brew install httpd"
    echo "  Fedora/RHEL: sudo dnf install httpd-tools"
    exit 1
fi

# Function to test webserver
test_webserver() {
    local name=$1
    local compose_file=$2
    
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}Testing: $name${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    
    # Stop any running containers
    echo -e "${BLUE}→ Stopping containers...${NC}"
    docker compose down > /dev/null 2>&1 || true
    docker compose -f docker-compose.apache.yml down > /dev/null 2>&1 || true
    sleep 2
    
    # Start containers
    echo -e "${BLUE}→ Starting $name...${NC}"
    if [ "$compose_file" = "docker-compose.yml" ]; then
        docker compose up -d > /dev/null 2>&1
    else
        docker compose -f "$compose_file" up -d > /dev/null 2>&1
    fi
    
    # Wait for containers to be ready
    echo -e "${BLUE}→ Waiting for containers to be ready...${NC}"
    sleep 10
    
    # Check if containers are running
    if [ "$compose_file" = "docker-compose.yml" ]; then
        if ! docker compose ps | grep -q "Up"; then
            echo -e "${RED}❌ Containers failed to start!${NC}"
            docker compose logs
            return 1
        fi
    else
        if ! docker compose -f "$compose_file" ps | grep -q "Up"; then
            echo -e "${RED}❌ Containers failed to start!${NC}"
            docker compose -f "$compose_file" logs
            return 1
        fi
    fi
    
    # Wait for webserver to respond
    echo -e "${BLUE}→ Waiting for webserver to respond...${NC}"
    for i in {1..30}; do
        if curl -s -o /dev/null -w "%{http_code}" "$URL" | grep -q "200"; then
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}❌ Webserver did not respond in time!${NC}"
            return 1
        fi
        sleep 1
    done
    
    echo -e "${GREEN}✓ Webserver is ready${NC}"
    echo ""
    
    # Run tests
    echo -e "${BLUE}→ Running performance test...${NC}"
    echo -e "   Requests: $REQUESTS"
    echo -e "   Concurrency: $CONCURRENCY"
    echo ""
    
    # Run Apache Bench
    ab -n $REQUESTS -c $CONCURRENCY "$URL" > /tmp/ab_result_$name.txt 2>&1
    
    # Parse results
    local rps=$(grep "Requests per second:" /tmp/ab_result_$name.txt | awk '{print $4}')
    local time_per_req=$(grep "Time per request:" /tmp/ab_result_$name.txt | head -1 | awk '{print $4}')
    local transfer_rate=$(grep "Transfer rate:" /tmp/ab_result_$name.txt | awk '{print $3}')
    local failed=$(grep "Failed requests:" /tmp/ab_result_$name.txt | awk '{print $3}')
    
    # Display results
    echo -e "${GREEN}Results:${NC}"
    echo -e "  Requests per second:    ${YELLOW}$rps${NC}"
    echo -e "  Time per request:       ${YELLOW}$time_per_req ms${NC}"
    echo -e "  Transfer rate:          ${YELLOW}$transfer_rate KB/sec${NC}"
    echo -e "  Failed requests:        ${YELLOW}$failed${NC}"
    echo ""
    
    # Test specific features
    echo -e "${BLUE}→ Testing features...${NC}"
    
    # Test 1: Cache headers
    if curl -s -I "$URL/assets/index.js" 2>/dev/null | grep -q "Cache-Control"; then
        echo -e "  ${GREEN}✓${NC} Cache headers present"
    else
        echo -e "  ${RED}✗${NC} Cache headers missing"
    fi
    
    # Test 2: Gzip compression
    if curl -s -I -H "Accept-Encoding: gzip" "$URL" 2>/dev/null | grep -q "Content-Encoding: gzip"; then
        echo -e "  ${GREEN}✓${NC} Gzip compression active"
    else
        echo -e "  ${RED}✗${NC} Gzip compression inactive"
    fi
    
    # Test 3: API proxy
    if curl -s "$URL/api/health" 2>/dev/null | grep -q "ok"; then
        echo -e "  ${GREEN}✓${NC} API proxy working"
    else
        echo -e "  ${RED}✗${NC} API proxy not working"
    fi
    
    # Test 4: SPA routing
    if curl -s "$URL/settings" 2>/dev/null | grep -q "<!DOCTYPE html>"; then
        echo -e "  ${GREEN}✓${NC} SPA routing working"
    else
        echo -e "  ${RED}✗${NC} SPA routing not working"
    fi
    
    echo ""
    
    # Get container stats
    echo -e "${BLUE}→ Container stats:${NC}"
    if [ "$compose_file" = "docker-compose.yml" ]; then
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep -E "updesk|NAME"
    else
        docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep -E "updesk|NAME"
    fi
    
    echo ""
    
    # Save results for comparison
    echo "$name|$rps|$time_per_req|$transfer_rate|$failed" >> /tmp/comparison_results.txt
}

# Clear previous results
rm -f /tmp/comparison_results.txt

# Test nginx
test_webserver "nginx" "docker-compose.yml"

# Test Apache
test_webserver "Apache" "docker-compose.apache.yml"

# Display comparison
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Comparison Summary${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Parse results
nginx_results=$(grep "nginx" /tmp/comparison_results.txt)
apache_results=$(grep "Apache" /tmp/comparison_results.txt)

nginx_rps=$(echo "$nginx_results" | cut -d'|' -f2)
nginx_time=$(echo "$nginx_results" | cut -d'|' -f3)
nginx_transfer=$(echo "$nginx_results" | cut -d'|' -f4)
nginx_failed=$(echo "$nginx_results" | cut -d'|' -f5)

apache_rps=$(echo "$apache_results" | cut -d'|' -f2)
apache_time=$(echo "$apache_results" | cut -d'|' -f3)
apache_transfer=$(echo "$apache_results" | cut -d'|' -f4)
apache_failed=$(echo "$apache_results" | cut -d'|' -f5)

# Display table
printf "%-25s %-20s %-20s\n" "Metric" "nginx" "Apache"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
printf "%-25s %-20s %-20s\n" "Requests per second" "$nginx_rps" "$apache_rps"
printf "%-25s %-20s %-20s\n" "Time per request (ms)" "$nginx_time" "$apache_time"
printf "%-25s %-20s %-20s\n" "Transfer rate (KB/s)" "$nginx_transfer" "$apache_transfer"
printf "%-25s %-20s %-20s\n" "Failed requests" "$nginx_failed" "$apache_failed"
echo ""

# Calculate winner
echo -e "${GREEN}Winner:${NC}"
if (( $(echo "$nginx_rps > $apache_rps" | bc -l) )); then
    diff=$(echo "scale=2; ($nginx_rps - $apache_rps) / $apache_rps * 100" | bc)
    echo -e "  ${GREEN}nginx${NC} is ${YELLOW}${diff}%${NC} faster (Requests per second)"
else
    diff=$(echo "scale=2; ($apache_rps - $nginx_rps) / $nginx_rps * 100" | bc)
    echo -e "  ${GREEN}Apache${NC} is ${YELLOW}${diff}%${NC} faster (Requests per second)"
fi
echo ""

# Recommendation
echo -e "${BLUE}Recommendation:${NC}"
echo ""
if (( $(echo "$nginx_rps > $apache_rps * 1.1" | bc -l) )); then
    echo -e "  ${GREEN}→ Use nginx${NC} for maximum performance"
    echo -e "    nginx is significantly faster (>10%)"
elif (( $(echo "$apache_rps > $nginx_rps * 1.1" | bc -l) )); then
    echo -e "  ${GREEN}→ Use Apache${NC} for maximum performance"
    echo -e "    Apache is significantly faster (>10%)"
else
    echo -e "  ${YELLOW}→ Performance is similar (<10% difference)${NC}"
    echo -e "    ${GREEN}nginx:${NC} Slightly faster, lower memory"
    echo -e "    ${GREEN}Apache:${NC} More stable under load, more features"
    echo ""
    echo -e "  ${BLUE}Choose based on your priorities:${NC}"
    echo -e "    - Maximum performance → nginx"
    echo -e "    - Maximum stability → Apache"
fi
echo ""

# Cleanup
echo -e "${BLUE}→ Cleaning up...${NC}"
docker compose down > /dev/null 2>&1 || true
docker compose -f docker-compose.apache.yml down > /dev/null 2>&1 || true

echo -e "${GREEN}✓ Done!${NC}"
echo ""
echo -e "${BLUE}Full results saved in:${NC}"
echo -e "  /tmp/ab_result_nginx.txt"
echo -e "  /tmp/ab_result_Apache.txt"
echo ""