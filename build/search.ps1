$headers = @{
    'api-key' = $env:SEARCH_KEY
    'Content-Type' = 'application/json' 
    'Accept' = 'application/json' 
}


$url = 'https://rfg-search-service.search.windows.net/indexes/games/docs?api-version=2020-06-30&search=china*&$count=true'

Invoke-RestMethod -Uri $url -Headers $headers | ConvertTo-Json