# -*- coding: utf-8 -*-

# 20210312 joeljp
# This script was for reducing the rather verbose lia.tsv down to the relevant attributes
# It does what it says on the tin, however I noticed that quite a number of fields are empty
# EG, none of the birkenes_uib files have either agegroup, age or birth
# Besides, I think it's probably easier to go straight from the full tsv file down to a succint json file
# Meaning this script is probably redundant

require "csv"

# 1. Read meta.file.tsv (eg. ../dat/informants.utf8.tsv)
# For NDC, looks like this:
#tid	Filnamn	Original fil	NB-kode	Opptaksår	Eigar	Fri	Format	Kvalitet	Innhald - stikkord	Innhald	Intervjuar	Lengde (min)	Kommentar informant	Same informant som	Informantnamn	Aldersgruppe	Alder	Fødselsår	Kjønn	Stad	Kommune 1960	Kommune 1978	Fylke	yrke	Kommentar opptak
meta = CSV.read(ARGV[0], { :col_sep => "\t", :headers => true, encoding: "UTF-8" })
# Remove superfluous columns

wanted = %w(tid Opptaksår Alder Fødselsår Kjønn 1960)

meta.headers.each {|h| meta.delete(h) unless wanted.include?(h)}

places = Hash.new{|h,k| h[k] = false}
missing = {}
# Ensure no spaces in tid (think this was just a problem with BB)
meta.each do |r|
  r['tid'] = r['tid'].sub(/ +/,"_")
  if r['1960'].nil?
    if places[r['tid'].sub(/_.+/,"")]
      r['1960'] = places[r['tid'].sub(/_.+/,"")]
    else
      fix = {"birkenes" => "birkenes", "aasnes" => "åsnes", "rauma" => "rauma", "foldereid" => "foldereid", "harran" => "harran", "overhalla" => "overhalla", "snaasa" => "snåsa", "soerli" => "sørli", "steinkjer" => "steinkjer", "leksvik" => "leksvik", "kolbu" => "kolbu", "sand" => "sand", "soerfroeya" => "sørfrøya"}
      r['1960'] = fix[r['tid'].sub(/_.+/,"")]
      missing[r['1960'].sub(/_.+/,"")] = true
    end
  else
    places[r['tid'].sub(/_.+/,"")] = r['1960']
  end
end

STDERR.puts missing.keys.to_s

# 2. Write new file WITH NEW TID

CSV.open("lia.mini.tsv", "wb", :write_headers => true, :headers => ["tid","rec","age","birth","sex","place"], :col_sep => "\t") do |tsv|
  meta.each do |r|
    tsv << r
  end
end
