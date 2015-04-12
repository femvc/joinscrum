mongoexport -d joinscrum_api -c backlog      -o     backlog.dat
mongoexport -d joinscrum_api -c product      -o     product.dat
mongoexport -d joinscrum_api -c sprint       -o      sprint.dat
mongoexport -d joinscrum_api -c task         -o        task.dat
mongoexport -d joinscrum_api -c taskindex    -o   taskindex.dat
mongoexport -d joinscrum_api -c tasklog      -o     tasklog.dat
mongoexport -d joinscrum_api -c user         -o        user.dat

