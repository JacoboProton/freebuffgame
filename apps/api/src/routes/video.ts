import { Router } from 'express';
import { authenticate, AuthRequest } from '../middlewares/auth.js';
import { AppError } from '../middlewares/error.js';

export const videoRouter = Router();

// Create a Mux Direct Upload URL
videoRouter.post('/upload', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const muxTokenId = process.env.MUX_TOKEN_ID;
    const muxTokenSecret = process.env.MUX_TOKEN_SECRET;

    if (!muxTokenId || !muxTokenSecret) {
      throw new AppError('Mux credentials not configured', 500);
    }

    const auth = Buffer.from(`${muxTokenId}:${muxTokenSecret}`).toString('base64');

    const title = req.body.title || `Upload-${Date.now()}`;

    const response = await fetch('https://api.mux.com/video/v1/uploads', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        new_asset_settings: {
          playback_policies: ['public'],
        },
        cors_origin: process.env.CORS_ORIGIN || '*',
        title,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AppError(data.error?.message || 'Failed to create upload', response.status);
    }

    res.json({
      status: 'success',
      data: {
        uploadId: data.data.id,
        uploadUrl: data.data.url,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Check upload status
videoRouter.get('/upload/:uploadId', authenticate, async (req: AuthRequest, res, next) => {
  try {
    const muxTokenId = process.env.MUX_TOKEN_ID;
    const muxTokenSecret = process.env.MUX_TOKEN_SECRET;

    if (!muxTokenId || !muxTokenSecret) {
      throw new AppError('Mux credentials not configured', 500);
    }

    const auth = Buffer.from(`${muxTokenId}:${muxTokenSecret}`).toString('base64');
    const { uploadId } = req.params;

    const response = await fetch(`https://api.mux.com/video/v1/uploads/${uploadId}`, {
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new AppError(data.error?.message || 'Upload not found', response.status);
    }

    const result: any = {
      uploadId: data.data.id,
      status: data.data.status,
      assetId: data.data.asset_id,
    };

    // If upload is complete, get the playbackId from the asset
    if (data.data.status === 'asset_created' && data.data.asset_id) {
      try {
        const assetResponse = await fetch(`https://api.mux.com/video/v1/assets/${data.data.asset_id}`, {
          headers: { 'Authorization': `Basic ${auth}` },
        });
        const assetData = await assetResponse.json();
        if (assetData.data && assetData.data.playback_ids?.length > 0) {
          result.playbackId = assetData.data.playback_ids[0].id;
        }
      } catch {
        // Asset details unavailable — still return the status
      }
    }

    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
});
