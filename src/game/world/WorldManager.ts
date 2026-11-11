/**
 * LAB GUARDIAN - World Manager
 * Dynamically switches and loads the 4 campaign locations while safely disposing previous scene nodes
 */

import { Scene } from '@babylonjs/core';
import { LocationId } from '../campaign/CampaignTypes';
import { HubEnvironment, MapBuildResult } from './HubEnvironment';
import { ResearchWingEnvironment } from './ResearchWingEnvironment';
import { RefineryEnvironment } from './RefineryEnvironment';
import { VaultEnvironment } from './VaultEnvironment';
import { AcademyEnvironment } from './AcademyEnvironment';

export class WorldManager {
  private scene: Scene;
  private currentMapResult: MapBuildResult | null = null;
  private currentLocationId: LocationId = 'hub';

  constructor(scene: Scene) {
    this.scene = scene;
  }

  public loadLocation(locationId: LocationId): MapBuildResult {
    // 1. Dispose previous map nodes if present
    this.disposeCurrentMap();

    // 2. Build the requested map
    let result: MapBuildResult;
    switch (locationId) {
      case 'academy':
        result = AcademyEnvironment.build(this.scene);
        break;
      case 'research_wing':
        result = ResearchWingEnvironment.build(this.scene);
        break;
      case 'refinery':
        result = RefineryEnvironment.build(this.scene);
        break;
      case 'vault':
        result = VaultEnvironment.build(this.scene);
        break;
      case 'hub':
      default:
        result = HubEnvironment.build(this.scene);
        break;
    }

    this.currentMapResult = result;
    this.currentLocationId = locationId;

    return result;
  }

  public getCurrentMapResult(): MapBuildResult | null {
    return this.currentMapResult;
  }

  public getCurrentLocationId(): LocationId {
    return this.currentLocationId;
  }

  public disposeCurrentMap(): void {
    if (this.currentMapResult) {
      if (this.currentMapResult.rootNode) {
        this.currentMapResult.rootNode.dispose(false, true);
      }
      this.currentMapResult = null;
    }
  }

  public dispose(): void {
    this.disposeCurrentMap();
  }
}
