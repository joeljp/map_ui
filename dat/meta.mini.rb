# -*- coding: utf-8 -*-

require "csv"

# 1. Read meta.file.tsv (eg. ../dat/informants.utf8.tsv)
# For NDC, looks like this:
#tid	alias	rec	birth	sex	age	agegroup	district_code	place	area	region	country	notes	audio	video	active	taxonomy	wc	informant	lat	lng	open

meta = CSV.read(ARGV[0], { :col_sep => "\t", :headers => true, encoding: "UTF-8" })
# Remove superfluous columns
meta.delete("alias")
meta.delete("rec")
meta.delete("district_code")
meta.delete("notes")
meta.delete("audio")
meta.delete("video")
meta.delete("active")
meta.delete("taxonomy")
meta.delete("wc")
meta.delete("lat")
meta.delete("lng")
meta.delete("open")
meta.delete("informant")
# Ensure no spaces in tid (think this was just a problem with BB)
meta.each do |r|
  r['code'] = r['code'].sub(/ +/,"_")
end

# 2. Write new file WITH NEW TID

CSV.open("/corpora/speech/ndc/dat/meta.mini.tsv", "wb", :write_headers => true, :headers => ["tid","birth","sex","age","agegroup","place","area","region","country"], :col_sep => "\t") do |tsv|
  meta.each do |r|
    tsv << r
  end
end
