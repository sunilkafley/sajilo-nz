$ErrorActionPreference = 'Stop'
$types = @{ UNI='University'; POLLY='Polytechnic'; PTE='Private training establishment'; WANA='Wānanga' }
function Plain([string]$value) { [System.Net.WebUtility]::HtmlDecode(($value -replace '<[^>]+>',' ')) -replace '\s+',' ' }
$records = @{}
$searches = @()
foreach ($type in ($types.Keys | Sort-Object)) {
  foreach ($code in @('', 'Y')) {
    $url = "https://www.nzqa.govt.nz/providers/results.do?regionCode=0&typeCode=$type&category=&copApprovalStatus=$code&nameQuery="
    $html = (Invoke-WebRequest $url).Content
    $found = 0
    foreach ($row in [regex]::Matches($html,'(?s)<tr[^>]*>(.*?)</tr>')) {
      if ($row.Value -notmatch 'details.do\?providerId=(\d+)') { continue }
      $id = $Matches[1]
      $cells = [regex]::Matches($row.Value,'(?s)<td[^>]*>(.*?)</td>')
      if ($cells.Count -lt 2) { continue }
      $found++
      if (-not $records.ContainsKey($id)) {
        $records[$id] = @{id=$id; name=(Plain $cells[0].Groups[1].Value).Trim(); type=$types[$type]; locations=[System.Collections.Generic.List[string]]::new(); codeSignatory=$false}
      }
      $city = (Plain $cells[1].Groups[1].Value).Trim()
      if (-not $records[$id].locations.Contains($city)) { $records[$id].locations.Add($city) }
      if ($code -eq 'Y') { $records[$id].codeSignatory=$true }
    }
    if ($found -eq 0) { throw "No records parsed: $url" }
    $searches += @{url=$url; rows=$found}
  }
}
Write-Output "Unique provider records: $($records.Count)"
$result = $records.Values | ForEach-Object -Parallel {
  $item = $_
  $url = "https://www.nzqa.govt.nz/providers/details.do?providerId=$($item.id)"
  $html = (Invoke-WebRequest $url).Content
  function PlainText([string]$value) { ([System.Net.WebUtility]::HtmlDecode(($value -replace '<[^>]+>',' ')) -replace '\s+',' ').Trim() }
  $item.nzqa = $url
  $item.website = ''
  if ($html -match '(?s)<td>Website</td>\s*<td>(.*?)</td>') {
    $web = PlainText $Matches[1]
    if ($web -notmatch '^https?://') { $web = 'https://' + $web }
    $uri = $null
    if ([uri]::TryCreate($web,[UriKind]::Absolute,[ref]$uri) -and $uri.Host.Contains('.')) { $item.website=$web }
  }
  if ($html -match '(?s)<h1[^>]*>(.*?)</h1>') { $item.name=(PlainText $Matches[1]) -replace '^Organisations\s*&gt;&gt;\s*NZQA\s*-\s*','' -replace '^Organisations\s*>>\s*NZQA\s*-\s*','' }
  $item.address = @()
  if ($html -match '(?s)<td[^>]*>Address</td>\s*<td>(.*?)</td>') { $item.address=@($Matches[1] -split '<br\s*/?>' | ForEach-Object { PlainText $_ } | Where-Object { $_ }) }
  $item
} -ThrottleLimit 6
if ($result.Count -ne $records.Count) { throw 'Incomplete detail retrieval' }
@{source='https://www.nzqa.govt.nz/providers/index.do'; retrievedOn=(Get-Date -Format 'yyyy-MM-dd'); searches=$searches; providers=@($result | Sort-Object name)} | ConvertTo-Json -Depth 8 | Set-Content 'docs/study-register-data.json' -Encoding utf8
Write-Output "Saved $($result.Count) provider records"

