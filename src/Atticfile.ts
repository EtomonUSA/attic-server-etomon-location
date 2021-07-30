import {
  IConfig,
    IApplicationContext,
    IPlugin
} from '@znetstar/attic-common/lib/Server';
import {IIdentity, IRPC} from "@znetstar/attic-common";
import {GeoRPCHandler, IGeoRPCHandler} from "@etomon/etomon-location/lib/api/server/routes";
import {GeoResolverOptions, LocationResolvePriorities} from "@etomon/etomon-location/lib/api/server/GeoResolver";
import {GeoResolver} from "@etomon/etomon-location";
import {EncodingOptions} from "@etomon/encode-tools/lib/IEncodeTools";
const { IORedisDown } = require('@etomon/ioredisdown');
const LevelUp = require('LevelUp');
import {defaultResolvePriorities} from "@etomon/etomon-location/lib/api/server/GeoResolver";

export type AtticServerEtomonLocationRPCHandler = IRPC&IGeoRPCHandler;

export type AtticServerEtomonLocationConfig = IConfig&{
  geoResolverGoogleApiKey: string;
  geoResolverPathToGeoIPCity: string;
  geoResolverUseCache?: boolean;
  geoResolverResolvePriority?: LocationResolvePriorities[];
  geoResolverEncodeOptions?: EncodingOptions
}

export type AtticServerEtomonLocationApplicationContext = IApplicationContext&{
  config: AtticServerEtomonLocationConfig;
  rpcServer: {
    methods: AtticServerEtomonLocationRPCHandler
  };
  geoResolver: GeoResolver;
};

export class AtticServerEtomonLocation implements IPlugin {
    protected geoResolver: GeoResolver;
    protected geoHandler: GeoRPCHandler;
    protected cache?: unknown;
    constructor(public applicationContext: AtticServerEtomonLocationApplicationContext) {
      if (this.applicationContext.config.geoResolverUseCache) {
        this.cache = LevelUp(
          new IORedisDown('blah', void(0), this.applicationContext.config.redisUri),
          this.applicationContext.config.redisUri
        )
      }
      this.geoResolver = this.applicationContext.geoResolver = new GeoResolver(
        this.applicationContext.config.geoResolverGoogleApiKey,
        this.applicationContext.config.geoResolverPathToGeoIPCity,
        {
           resolvePriority: defaultResolvePriorities,
          cache: this.cache as any,
          encodeOptions: this.applicationContext.config.geoResolverEncodeOptions
        }
      );

      this.geoHandler = new GeoRPCHandler(this.geoResolver);
    }


    public async init(): Promise<void> {
      this.applicationContext.rpcServer.methods.resolveLocations = this.geoHandler.resolveLocations.bind(this.geoHandler);
      this.applicationContext.rpcServer.methods.resolveOneLocation = this.geoHandler.resolveOneLocation.bind(this.geoHandler);
      this.applicationContext.rpcServer.methods.autocompleteSearch = this.geoHandler.autocompleteSearch.bind(this.geoHandler);
    }

    get name() { return `@etomon/attic-server-etomon-location`; }
}

export default AtticServerEtomonLocation;
