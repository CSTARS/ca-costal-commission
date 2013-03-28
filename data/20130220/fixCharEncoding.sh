FILES=./*csv
for f in $FILES
do
  echo "Processing $f file..."
  cp $f $f.bck
  cat $f.bck | iconv -f WINDOWS-1252 -t UTF8 > $f
done
