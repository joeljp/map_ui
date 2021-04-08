# -*- coding: utf-8 -*-

# joeljp 20210408

# ARGV[0] should be metadata where last elements are place
# ARGV[1] is the coodinate file

require 'json'

meta = JSON.parse(File.read(ARGV[0], :encoding => "UTF-8"))
coor = JSON.parse(File.read(ARGV[1], :encoding => "UTF-8"))

places = {}

meta.each do |e|
  next if e[-1] == "place"
  places[e[-1]] = true
end

places.each_key do |k|
  if !coor.has_key? k
    STDERR.puts k
  end
end
