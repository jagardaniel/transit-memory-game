import csv
import sys

# Script to parse a CSV list of metro stations and print it out in a copy-paste friendly format
# The list (table) is from Wikipedia and converted to a CSV file with https://tableconvert.com/mediawiki-to-csv
# https://sv.wikipedia.org/w/index.php?title=Lista_%C3%B6ver_tunnelbanestationer_i_Stockholm

# Manually removed the columns that we don't need, the station Kymlinge (ghost station) and
# fixed the station names so they don't include any parentheses with their previous names.
# The stations are then CTRL+V:d into the src/data/metro.ts file, for each metro line

if (len(sys.argv) < 2):
    sys.exit("You need to specify a line. Example: python parse_stations.py Blå")

line = sys.argv[1]

with open("data/metro_stations.csv") as csv_file:
    reader = csv.reader(csv_file)

    for row in reader:
        station_name, line_name, position = row

        position = position.split("/")[2].strip()
        x, y = position.split(";")
        y = y.strip().split(" ")[0]

        if line == line_name:
          print(f'{{ name: "{station_name}", x: {x}, y: {y} }},')

    csv_file.close()
