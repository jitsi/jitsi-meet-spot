#!/bin/bash

echo $(date +"%Y%m%d")-$(git rev-parse --short HEAD)
