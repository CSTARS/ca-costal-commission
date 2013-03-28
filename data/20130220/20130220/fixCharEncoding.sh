FILES=./*csv
for f in $FILES
do
  echo "Processing $f file..."
  less $f | iconv -f WINDOWS-1252 -t UTF8 > $f
done
