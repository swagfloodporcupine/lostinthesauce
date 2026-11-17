$path = "lib/mock-listings.ts"
$lines = Get-Content $path
$name = $null
$category = $null
$out = New-Object System.Text.StringBuilder
$handles = @{
  "Amara Venn" = @{ ig = "amara_venn"; sc = "amara-venn" }
  "Luca Ferreira" = @{ ig = "luca_ferreira"; sc = "luca-ferreira" }
  "Tumi on Wax" = @{ ig = "tumionwax"; sc = "tumi-on-wax" }
  "Signal Path Audio" = @{ ig = "signalpathaudio" }
  "Northlight Crew" = @{ ig = "northlightcrew" }
  "Mila Jacobs Photo" = @{ ig = "milajacobsphoto" }
  "Afterglow Films" = @{ ig = "afterglowfilms" }
  "The Glasshouse" = @{ ig = "theglasshouse_ct" }
  "Oak & Vine Estate" = @{ ig = "oakandvine" }
}
foreach ($line in $lines) {
    if ($line -match 'name:\s*"([^"]+)"') { $name = $matches[1] }
    if ($line -match 'category:\s*"([^"]+)"') { $category = $matches[1] }
    $out.AppendLine($line) | Out-Null
    if ($line -match '^\s*mixTitle:') {
        $indent = ""
        if ($line -match '^(\s*)') { $indent = $matches[1] }
        $h = $handles[$name]
        $ig = $name -replace '\s', '' -replace '&', ''
        if ($h) { $ig = $h.ig }
        $out.AppendLine("${indent}instagram: `"$ig`",") | Out-Null
        if ($category -eq "DJs") {
            $sc = $name -replace '\s', '-' -replace '&', ''
            $sc = $sc.ToLower()
            if ($h) { $sc = $h.sc }
            $out.AppendLine("${indent}soundcloud: `"soundcloud.com/$sc`",") | Out-Null
        } else {
            $out.AppendLine("${indent}soundcloud: null,") | Out-Null
        }
        $name = $null
        $category = $null
    }
}
$out.ToString() | Set-Content $path
Write-Host "done"
