$resourceGroupName = "rentfreegames"

$accountName = (Get-AzCosmosDBAccount -ResourceGroupName $resourceGroupName).Name

$databaseName = "Games Database"

Get-AzCosmosDBSqlDatabase `
    -ResourceGroupName $resourceGroupName `
    -AccountName $accountName `
    -Name $databaseName

$containerName = "Games Container"

Get-AzCosmosDBSqlContainer `
    -ResourceGroupName $resourceGroupName `
    -AccountName $accountName `
    -DatabaseName $databaseName `
    -Name $containerName

$cosmosDBAccountKey = Get-AzCosmosDBAccountKey `
    -ResourceGroupName $resourceGroupName `
    -Name $accountName

$key = $cosmosDBAccountKey.PrimaryMasterKey

$primaryKey = ConvertTo-SecureString -String $key -AsPlainText -Force

$cosmosDbContext = New-CosmosDbContext `
    -Account $accountName `
    -Database $databaseName `
     -Key $primaryKey
 

# $ResponseHeader = $null
# $collections = Get-CosmosDbCollection `
#     -Context $cosmosDbContext `
#     -Id 'Games' `
#     -ResponseHeader ([ref] $ResponseHeader)
$indexingPolicyJson = @'
{
    "automatic":true,
    "indexingMode":"Consistent",
    "includedPaths":[
        {
            "path":"/*"
        }
    ],
    "excludedPaths":[]
}
'@
New-CosmosDbCollection -Context $cosmosDbContext -Id 'Games' -PartitionKey 'BGGId' -IndexingPolicyJson $indexingPolicyJson

$games = Get-Content "..\src\rentfreegames\data\games.json" | Out-String | ConvertFrom-Json

$games | Foreach-Object {
    $id = $_.BGGId
    $_ | Add-Member -Name "id" -Value $id -MemberType NoteProperty
    $document = ($_ | ConvertTo-Json | Out-String)

    New-CosmosDbDocument `
        -Context $cosmosDbContext `
        -CollectionId 'Games' `
        -DocumentBody $document `
        -PartitionKey $id
}