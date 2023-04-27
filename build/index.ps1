$headers = @{
    'api-key' = $env:SEARCH_KEY
    'Content-Type' = 'application/json' 
    'Accept' = 'application/json' 
}

$url = "https://rfg-search-service.search.windows.net/indexes?api-version=2020-06-30&"

Invoke-RestMethod -Uri $url -Headers $headers | ConvertTo-Json

$body = @"
{
    "name": "games",  
    "fields": [
        {"name": "BGGId", "type": "Edm.String", "key": true, "filterable": true},
        {"name": "Name", "type": "Edm.String", "searchable": true, "filterable": false, "sortable": true, "facetable": false},
        {"name": "Description", "type": "Edm.String", "searchable": true, "filterable": false, "sortable": false, "facetable": false, "analyzer": "en.lucene"},
        {"name": "YearPublished", "type": "Edm.String", "searchable": true, "filterable": true, "sortable": true, "facetable": true},
        {"name": "GameWeight", "type": "Edm.Double", "filterable": true, "sortable": false, "facetable": true},
        {"name": "AvgRating", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "BayesAvgRating", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "StdDev", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "MinPlayers", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "MaxPlayers", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "ComAgeRec", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "LanguageEase", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "BestPlayers", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "GoodPlayers", "type": "Edm.String", "filterable": true, "sortable": true, "facetable": true},
        {"name": "NumOwned", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "NumWant", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "NumWish", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "NumWeightVotes", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "MfgPlaytime", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "ComMinPlaytime", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "ComMaxPlaytime", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "MfgAgeRec", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "NumUserRatings", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "NumComments", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "NumAlternates", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "NumExpansions", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "NumImplementations", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "IsReimplementation", "type": "Edm.Boolean", "filterable": true, "sortable": true, "facetable": true},
        {"name": "Family", "type": "Edm.String", "filterable": true, "sortable": true, "facetable": true},
        {"name": "Kickstarted", "type": "Edm.Boolean", "filterable": true, "sortable": true, "facetable": true},
        {"name": "ImagePath", "type": "Edm.String", "filterable": true, "sortable": true, "facetable": true},
        {"name": "Rank", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "RankStrat", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "RankAbstract", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "RankFamily", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "RankTheme", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "RankCgs", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "RankWargame", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "Rankpartygame", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "RankChildrengames", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "CatTheme", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "CatStrat", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "CatWar", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "CatFamily", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "CatCgs", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "CatAbstact", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "CatAbstract", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "CatParty", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true},
        {"name": "CatChildrens", "type": "Edm.Double", "filterable": true, "sortable": true, "facetable": true}
    ]
}
"@

$url = "https://rfg-search-service.search.windows.net/indexes/games?api-version=2020-06-30"
Invoke-RestMethod -Uri $url -Headers $headers -Method Put -Body $body | ConvertTo-Json

$body = @"
{
    "value": $(Get-Content games.json -Encoding utf8)
}
"@

$url = "https://rfg-search-service.search.windows.net/indexes/games/docs/index?api-version=2020-06-30"
Invoke-RestMethod -Uri $url -Headers $headers -Method Post -Body $body | ConvertTo-Json

