#!/bin/bash

#python3 vion_csv.py "csv/UIT-ViON_train.csv" > "corpus-urls-train.csv"
#python3 vion_csv.py "csv/UIT-ViON_test.csv" > "corpus-urls-test.csv"
#python3 vion_csv.py "csv/UIT-ViON_dev.csv" > "corpus-urls-dev.csv"


for line in `cat corpus-urls-train.csv`;
do
    cols=($(echo $line |  tr "," " "))
    url="${cols[0]}"
    name=$(basename $url)
    name="${name%.*}"
    cat="${cols[1]}"
    if [ ! -f "xmls/${name}.xml" ]; then
        echo "Download '${name}.xml'..."
        curl -s -X POST -d "url=$url&format=xml" http://127.0.0.1:8081/api/fetch -o "xmls/${name}.xml"
    fi
    echo "Build corpus '${name}.corpus'..."
    python3 vion.py "xmls/${name}.xml" "corpus/${name}.corpus" "$cat"
    sleep 1s
done

for line in `cat corpus-urls-test.csv`;
do
    cols=($(echo $line |  tr "," " "))
    url="${cols[0]}"
    name=$(basename $url)
    name="${name%.*}"
    cat="${cols[1]}"
    if [ ! -f "xmls/${name}.xml" ]; then
        echo "Download '${name}.xml'..."
        curl -s -X POST -d "url=$url&format=xml" http://127.0.0.1:8081/api/fetch -o "xmls/${name}.xml"
    fi
    echo "Build corpus '${name}.corpus'..."
    python3 vion.py "xmls/${name}.xml" "corpus/${name}.corpus" "$cat"
    sleep 1s
done

for line in `cat corpus-urls-dev.csv`;
do
    cols=($(echo $line |  tr "," " "))
    url="${cols[0]}"
    name=$(basename $url)
    name="${name%.*}"
    cat="${cols[1]}"
    if [ ! -f "xmls/${name}.xml" ]; then
        echo "Download '${name}.xml'..."
        curl -s -X POST -d "url=$url&format=xml" http://127.0.0.1:8081/api/fetch -o "xmls/${name}.xml"
    fi
    echo "Build corpus '${name}.corpus'..."
    python3 vion.py "xmls/${name}.xml" "corpus/${name}.corpus" "$cat"
    sleep 1s
done
