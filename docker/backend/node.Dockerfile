FROM node:23-bullseye-slim as base

ARG TIMEZONE="Asia/Dhaka"

ENV TZ="${TIMEZONE}"

USER root

ARG UID="1000"
ARG GID="1000"

RUN userdel -r node \
    && groupadd --gid ${GID} appuser \
    && useradd --uid ${UID} --create-home --system --comment "AppUser" --shell /bin/bash --gid appuser appuser \
    && mkdir -p /home/appuser/appsrc \
    && chown -R appuser:appuser /home/appuser/appsrc

WORKDIR /home/appuser/appsrc

COPY --chown=appuser:appuser ./codes/backend/package*.json ./

USER appuser

######################################################

FROM base as dev

USER root

RUN apt-get update \
    && apt-get install -y procps \
    && rm -rf /var/lib/apt/lists/*

USER appuser

COPY --chown=appuser:appuser ./codes/backend/ ./
RUN npm ci

STOPSIGNAL SIGTERM
CMD ["npm", "run", "start:dev"]


######################################################

FROM dev as builder

USER root

ARG SHOULD_RUN_CHOWN_TO_APPUSER="true"

RUN if [ "${SHOULD_RUN_CHOWN_TO_APPUSER}" = "true" ]; then \
    chown -R appuser:appuser . \
    ;fi

USER appuser

RUN npm run build \
    && npm ci --omit=dev

######################################################

FROM base as prod

COPY --chown=appuser:appuser --from=builder /home/appuser/appsrc/node_modules ./node_modules
COPY --chown=appuser:appuser --from=builder /home/appuser/appsrc/dist ./dist
COPY --chown=appuser:appuser --from=builder /home/appuser/appsrc/package.json /home/appuser/appsrc/package-lock.json ./

STOPSIGNAL SIGTERM

CMD [ "node", "dist/main" ]
