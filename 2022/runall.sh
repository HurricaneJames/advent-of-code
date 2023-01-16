#!/bin/bash
time for i in $(seq -w 1 25); do time pnpm run d$i; done
