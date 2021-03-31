# -*- coding: utf-8 -*-

require "csv"
require 'json'
meta = CSV.read(ARGV[0], { :col_sep => "\t", :headers => true, encoding: "UTF-8" })

json = []

# The following three lines will a corpus specific
@new_cols = %w(tid rec agegroup age birth sex place)
@cols = %w(tid Opptaksår Aldersgruppe Alder Fødselsår Kjønn 1960) # IE, the attributes we're interested in, as many seem irrelevant. EG, I just removed Aldersgruppe, as this won't add any functionality
@integer_vals = %w(Opptaksår Alder Fødselsår Aldersgrupp)

@nils = Hash.new{|h,k| h[k] = []}
@tid2missingVals = Hash.new{|h,k| h[k] = []}

json.push @new_cols

meta.each do |r|
  row = []
  tid = r['tid']
  @cols.each do |h|
    elt = r[h]
    if elt.nil?
      @nils[h].push tid
      @tid2missingVals[tid].push h
      row.push nil
      next
    end
    elt = elt.sub(/ +/,"_") if h == 'tid'
    if @integer_vals.include? h
      elt = elt.to_i
    end
    row.push elt
  end
  json.push row
end
# 2. Write new file WITH NEW TID

File.open("lia.json", "w:UTF-8"){|f| f.write json.to_json}
#STDERR.puts @nils.to_s
@tid2missingVals.each do |k,v|
  puts "#{k} ---> #{v.join(', ')}"
end
